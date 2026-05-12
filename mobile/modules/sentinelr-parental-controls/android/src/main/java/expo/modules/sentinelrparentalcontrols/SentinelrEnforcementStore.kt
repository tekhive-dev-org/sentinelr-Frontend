package expo.modules.sentinelrparentalcontrols

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

private const val PREFS_NAME = "sentinelr_parental_controls"
private const val KEY_PAYLOAD = "payload"

private data class EnforcementState(
  val monitoringEnabled: Boolean = false,
  val quickPauseEnabled: Boolean = false,
  val bedtimeEnabled: Boolean = false,
  val bedtimeStart: String? = null,
  val bedtimeEnd: String? = null,
  val screenTimeExpired: Boolean = false,
  val blockedPackages: Set<String> = emptySet(),
  val syncedAt: Long = 0L,
) {
  fun isBedtimeActive(now: Calendar = Calendar.getInstance()): Boolean {
    if (!bedtimeEnabled || bedtimeStart.isNullOrBlank() || bedtimeEnd.isNullOrBlank()) {
      return false
    }

    val startMinutes = bedtimeStart.toMinutes() ?: return false
    val endMinutes = bedtimeEnd.toMinutes() ?: return false
    val currentMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

    return if (startMinutes <= endMinutes) {
      currentMinutes in startMinutes until endMinutes
    } else {
      currentMinutes >= startMinutes || currentMinutes < endMinutes
    }
  }

  fun activeReason(context: Context, packageName: String): String? {
    if (!monitoringEnabled || SentinelrEnforcementStore.isPackageAllowed(context, packageName)) {
      return null
    }
    if (quickPauseEnabled) {
      return "Device is frozen"
    }
    if (screenTimeExpired) {
      return "Screen time limit reached"
    }
    if (isBedtimeActive()) {
      return "Bedtime is active"
    }
    if (blockedPackages.contains(packageName)) {
      return "This app is blocked"
    }
    return null
  }
}

internal object SentinelrEnforcementStore {
  private val alwaysAllowedPackages = setOf(
    "android",
    "com.android.systemui",
    "com.android.settings",
    "com.android.permissioncontroller",
    "com.google.android.permissioncontroller",
    "com.android.packageinstaller",
    "com.google.android.packageinstaller",
    "com.google.android.gms",
    "com.google.android.gsf",
  )

  fun savePayload(context: Context, payload: Map<String, Any?>) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_PAYLOAD, toJsonObject(payload).toString())
      .apply()
  }

  fun clear(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_PAYLOAD)
      .apply()
  }

  fun getStateMap(context: Context): Map<String, Any?> {
    val state = readState(context)
    return mapOf(
      "accessibilityEnabled" to isAccessibilityServiceEnabled(context),
      "monitoringEnabled" to state.monitoringEnabled,
      "quickPauseEnabled" to state.quickPauseEnabled,
      "bedtimeActive" to state.isBedtimeActive(),
      "screenTimeExpired" to state.screenTimeExpired,
      "blockedPackagesCount" to state.blockedPackages.size,
      "syncedAt" to state.syncedAt,
    )
  }

  fun getActiveReason(context: Context, packageName: String): String? {
    return readState(context).activeReason(context, packageName)
  }

  fun isAccessibilityServiceEnabled(context: Context): Boolean {
    val componentName = ComponentName(context, SentinelrAccessibilityService::class.java)
    val enabledServices = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ) ?: return false

    return enabledServices.split(':').any {
      it.equals(componentName.flattenToString(), ignoreCase = true)
    }
  }

  fun openAccessibilitySettings(context: Context): Boolean {
    return try {
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      true
    } catch (_: Exception) {
      false
    }
  }

  fun isPackageAllowed(context: Context, packageName: String): Boolean {
    if (packageName in alwaysAllowedPackages) {
      return true
    }
    if (packageName == context.packageName) {
      return true
    }

    val launcherPackage = getDefaultLauncherPackage(context)
    if (!launcherPackage.isNullOrBlank() && packageName == launcherPackage) {
      return true
    }

    return false
  }

  private fun getDefaultLauncherPackage(context: Context): String? {
    val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    val resolveInfo = context.packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
    return resolveInfo?.activityInfo?.packageName
  }

  private fun readState(context: Context): EnforcementState {
    val payloadString = context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_PAYLOAD, null)
      ?: return EnforcementState()

    return try {
      val payload = JSONObject(payloadString)
      EnforcementState(
        monitoringEnabled = payload.optBoolean("monitoringEnabled", false),
        quickPauseEnabled = payload.optBoolean("quickPauseEnabled", false),
        bedtimeEnabled = payload.optBoolean("bedtimeEnabled", false),
        bedtimeStart = payload.optString("bedtimeStart", null),
        bedtimeEnd = payload.optString("bedtimeEnd", null),
        screenTimeExpired = payload.optBoolean("screenTimeExpired", false),
        blockedPackages = payload.optJSONArray("blockedPackages").toStringSet(),
        syncedAt = payload.optLong("syncedAt", 0L),
      )
    } catch (_: Exception) {
      EnforcementState()
    }
  }

  private fun JSONArray?.toStringSet(): Set<String> {
    if (this == null) {
      return emptySet()
    }
    val values = mutableSetOf<String>()
    for (index in 0 until length()) {
      optString(index)?.takeIf { it.isNotBlank() }?.let(values::add)
    }
    return values
  }

  private fun toJsonObject(map: Map<String, Any?>): JSONObject {
    val jsonObject = JSONObject()
    map.forEach { (key, value) ->
      jsonObject.put(key, toJsonValue(value))
    }
    return jsonObject
  }

  private fun toJsonArray(items: Iterable<*>): JSONArray {
    val jsonArray = JSONArray()
    items.forEach { item ->
      jsonArray.put(toJsonValue(item))
    }
    return jsonArray
  }

  private fun toJsonValue(value: Any?): Any? {
    return when (value) {
      null -> JSONObject.NULL
      is Map<*, *> -> toJsonObject(value.entries.associate { (key, nestedValue) -> key.toString() to nestedValue })
      is Iterable<*> -> toJsonArray(value)
      is Array<*> -> toJsonArray(value.asIterable())
      else -> value
    }
  }
}

private fun String.toMinutes(): Int? {
  val parts = split(':')
  if (parts.size != 2) {
    return null
  }
  val hour = parts[0].toIntOrNull() ?: return null
  val minute = parts[1].toIntOrNull() ?: return null
  return hour * 60 + minute
}
