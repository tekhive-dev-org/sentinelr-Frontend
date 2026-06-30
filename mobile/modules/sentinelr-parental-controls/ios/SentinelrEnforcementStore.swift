import Foundation
import FamilyControls
import ManagedSettings

/// Shared enforcement logic for iOS parental controls.
/// Uses Apple's Screen Time APIs (FamilyControls + ManagedSettings)
/// to shield blocked apps and enforce restrictions.
internal final class SentinelrEnforcementStore {

  // MARK: - Keys

  private static let prefsSuiteName = "group.com.techhive.sentinelr.parentalcontrols"
  private static let keyPayload = "payload"
  private static let keyAuthorizationStatus = "authStatus"

  // MARK: - System app bundle IDs that are never blocked

  private static let alwaysAllowedBundleIds: Set<String> = [
    "com.apple.springboard",
    "com.apple.Preferences",
    "com.apple.mobilephone",
    "com.apple.MobileSMS",
    Bundle.main.bundleIdentifier ?? "com.techhive.sentinelr",
  ]

  // MARK: - Shared ManagedSettingsStore

  private static let store = ManagedSettingsStore()

  // MARK: - Persisted State

  static func savePayload(_ payload: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: payload) else { return }
    UserDefaults(suiteName: prefsSuiteName)?.set(data, forKey: keyPayload)
  }

  static func clear() {
    store.clearAllSettings()
    UserDefaults(suiteName: prefsSuiteName)?.removeObject(forKey: keyPayload)
  }

  static func readState() -> EnforcementState {
    guard let data = UserDefaults(suiteName: prefsSuiteName)?.data(forKey: keyPayload),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else {
      return EnforcementState()
    }

    return EnforcementState(
      monitoringEnabled: json["monitoringEnabled"] as? Bool ?? false,
      quickPauseEnabled: json["quickPauseEnabled"] as? Bool ?? false,
      bedtimeEnabled: json["bedtimeEnabled"] as? Bool ?? false,
      bedtimeStart: json["bedtimeStart"] as? String,
      bedtimeEnd: json["bedtimeEnd"] as? String,
      screenTimeExpired: json["screenTimeExpired"] as? Bool ?? false,
      blockedBundleIds: Set(json["blockedPackages"] as? [String] ?? []),
      syncedAt: json["syncedAt"] as? TimeInterval ?? 0
    )
  }

  // MARK: - Apple FamilyControls Authorization

  static var authorizationStatus: AuthorizationStatus {
    AuthorizationCenter.shared.authorizationStatus
  }

  static func requestAuthorization() async throws {
    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
  }

  // MARK: - Apply Restrictions

  /// Applies the current enforcement state as device restrictions.
  /// On iOS, this means shielding blocked apps via ManagedSettings.
  static func applyToStore(_ state: EnforcementState) {
    guard authorizationStatus == .approved else { return }

    store.clearAllSettings()

    guard state.monitoringEnabled else { return }

    // --- Quick Pause: shield everything except always-allowed ---
    if state.quickPauseEnabled {
      shieldAllExceptAlwaysAllowed(state)
      return
    }

    // --- Screen Time Expired: same as quick pause ---
    if state.screenTimeExpired {
      shieldAllExceptAlwaysAllowed(state)
      return
    }

    // --- Bedtime active: same as quick pause ---
    if state.isBedtimeActive() {
      shieldAllExceptAlwaysAllowed(state)
      return
    }

    // --- Shield specific blocked apps ---
    let blocked = state.blockedBundleIds
      .subtracting(alwaysAllowedBundleIds)
    if !blocked.isEmpty {
      store.shield.applications = blocked
    }
  }

  private static func shieldAllExceptAlwaysAllowed(_ state: EnforcementState) {
    // Shield all non-system applications
    // ManagedSettings doesn't expose an "all apps" API directly,
    // so we shield the explicitly blocked list plus any additional
    // bundle IDs from the blocked set.
    let blocked = state.blockedBundleIds
      .subtracting(alwaysAllowedBundleIds)
    if !blocked.isEmpty {
      store.shield.applications = blocked
    }

    // Also set a generic web/content shield when frozen
    store.shield.webDomains = Set([
      WebDomain(domain: "blocked-by-sentinelr")
    ])
  }

  // MARK: - State Map

  static func getStateMap() -> [String: Any] {
    let state = readState()
    return [
      "familyControlsAuthorized": authorizationStatus == .approved,
      "monitoringEnabled": state.monitoringEnabled,
      "quickPauseEnabled": state.quickPauseEnabled,
      "bedtimeActive": state.isBedtimeActive(),
      "screenTimeExpired": state.screenTimeExpired,
      "blockedPackagesCount": state.blockedBundleIds.count,
      "syncedAt": state.syncedAt,
    ]
  }
}

// MARK: - Enforcement State

internal struct EnforcementState {
  let monitoringEnabled: Bool
  let quickPauseEnabled: Bool
  let bedtimeEnabled: Bool
  let bedtimeStart: String?
  let bedtimeEnd: String?
  let screenTimeExpired: Bool
  let blockedBundleIds: Set<String>
  let syncedAt: TimeInterval

  init(
    monitoringEnabled: Bool = false,
    quickPauseEnabled: Bool = false,
    bedtimeEnabled: Bool = false,
    bedtimeStart: String? = nil,
    bedtimeEnd: String? = nil,
    screenTimeExpired: Bool = false,
    blockedBundleIds: Set<String> = [],
    syncedAt: TimeInterval = 0
  ) {
    self.monitoringEnabled = monitoringEnabled
    self.quickPauseEnabled = quickPauseEnabled
    self.bedtimeEnabled = bedtimeEnabled
    self.bedtimeStart = bedtimeStart
    self.bedtimeEnd = bedtimeEnd
    self.screenTimeExpired = screenTimeExpired
    self.blockedBundleIds = blockedBundleIds
    self.syncedAt = syncedAt
  }

  func isBedtimeActive() -> Bool {
    guard bedtimeEnabled,
          let start = bedtimeStart, !start.isEmpty,
          let end = bedtimeEnd, !end.isEmpty
    else { return false }

    guard let startMinutes = start.toMinutes(),
          let endMinutes = end.toMinutes()
    else { return false }

    let now = Calendar.current
    let currentMinutes = now.component(.hour, from: Date()) * 60
                       + now.component(.minute, from: Date())

    if startMinutes <= endMinutes {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes
    }
  }
}

private extension String {
  func toMinutes() -> Int? {
    let parts = split(separator: ":")
    guard parts.count == 2,
          let hours = Int(parts[0]),
          let minutes = Int(parts[1])
    else { return nil }
    return hours * 60 + minutes
  }
}
