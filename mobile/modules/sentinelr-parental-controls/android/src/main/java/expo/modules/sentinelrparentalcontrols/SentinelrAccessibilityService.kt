package expo.modules.sentinelrparentalcontrols

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

class SentinelrAccessibilityService : AccessibilityService() {
  private var lastBlockedPackage: String? = null
  private var lastBlockedAt = 0L

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event == null) {
      return
    }
    if (
      event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
      event.eventType != AccessibilityEvent.TYPE_WINDOWS_CHANGED
    ) {
      return
    }

    val packageName = event.packageName?.toString()?.trim().orEmpty()
    if (packageName.isBlank()) {
      return
    }

    val reason = SentinelrEnforcementStore.getActiveReason(applicationContext, packageName) ?: return

    performGlobalAction(GLOBAL_ACTION_HOME)
    maybeNotifyBlocked(packageName, reason)
  }

  override fun onInterrupt() {
    // No-op.
  }

  private fun maybeNotifyBlocked(packageName: String, reason: String) {
    val now = System.currentTimeMillis()
    val shouldNotify = packageName != lastBlockedPackage || now - lastBlockedAt > 1500
    if (!shouldNotify) {
      return
    }

    lastBlockedPackage = packageName
    lastBlockedAt = now
    Toast.makeText(applicationContext, reason, Toast.LENGTH_SHORT).show()
  }
}
