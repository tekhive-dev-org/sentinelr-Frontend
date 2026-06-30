import Foundation
import DeviceActivity
import ManagedSettings

/// Monitors device activity and enforces screen time limits.
/// Runs as a DeviceActivityMonitor extension (must be a separate target
/// in the Xcode project — see setup instructions in docs/ios_parental_controls.md).
///
/// NOTE: This class is registered as a DeviceActivityMonitor in a
/// separate extension target. The code here is a reference for that target.
/// The extension's Info.plist must declare:
///   NSExtensionPrincipalClass = SentinelrDeviceActivityMonitor
final class SentinelrDeviceActivityMonitor: DeviceActivityMonitor {

  private let store = ManagedSettingsStore()

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)

    let state = SentinelrEnforcementStore.readState()
    guard state.monitoringEnabled else { return }

    // When a restricted interval starts (e.g., bedtime), shield apps
    if activity == .bedtime || state.screenTimeExpired {
      SentinelrEnforcementStore.applyToStore(state)
    }
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)

    // When the restricted interval ends, re-evaluate
    let state = SentinelrEnforcementStore.readState()
    SentinelrEnforcementStore.applyToStore(state)
  }

  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    super.eventDidReachThreshold(event, activity: activity)

    // Screen time threshold reached — mark as expired
    let state = SentinelrEnforcementStore.readState()
    var updatedState = state
    updatedState = EnforcementState(
      monitoringEnabled: state.monitoringEnabled,
      quickPauseEnabled: state.quickPauseEnabled,
      bedtimeEnabled: state.bedtimeEnabled,
      bedtimeStart: state.bedtimeStart,
      bedtimeEnd: state.bedtimeEnd,
      screenTimeExpired: true,
      blockedBundleIds: state.blockedBundleIds,
      syncedAt: Date().timeIntervalSince1970
    )
    SentinelrEnforcementStore.applyToStore(updatedState)
  }
}

extension DeviceActivityName {
  static let bedtime = DeviceActivityName("bedtime")
  static let daily = DeviceActivityName("daily")
}
