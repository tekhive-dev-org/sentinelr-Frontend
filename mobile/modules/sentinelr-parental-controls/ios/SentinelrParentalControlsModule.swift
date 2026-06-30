import ExpoModulesCore

public class SentinelrParentalControlsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SentinelrParentalControls")

    Function("isNativeModuleAvailable") {
      // Screen Time APIs are available on iOS 15.0+
      if #available(iOS 15.0, *) {
        return true
      }
      return false
    }

    Function("isFamilyControlsAuthorized") {
      if #available(iOS 15.0, *) {
        return SentinelrEnforcementStore.authorizationStatus == .approved
      }
      return false
    }

    Function("requestFamilyControlsAuthorization") {
      if #available(iOS 15.0, *) {
        // Authorization must be requested from the main actor
        Task { @MainActor in
          do {
            try await SentinelrEnforcementStore.requestAuthorization()
          } catch {
            // Authorization denied or error — silently handled
          }
        }
      }
    }

    Function("openFamilyControlsSettings") {
      // Opens Settings app where user can manage Screen Time permissions
      guard let url = URL(string: UIApplication.openSettingsURLString) else {
        return
      }
      DispatchQueue.main.async {
        UIApplication.shared.open(url)
      }
    }

    Function("applyControls") { (payload: [String: Any]) in
      guard #available(iOS 15.0, *) else { return false }
      SentinelrEnforcementStore.savePayload(payload)
      let state = SentinelrEnforcementStore.readState()
      SentinelrEnforcementStore.applyToStore(state)
      return true
    }

    Function("clearControls") {
      guard #available(iOS 15.0, *) else { return false }
      SentinelrEnforcementStore.clear()
      return true
    }

    Function("getEnforcementState") {
      guard #available(iOS 15.0, *) else {
        return [
          "familyControlsAuthorized": false,
          "monitoringEnabled": false,
          "quickPauseEnabled": false,
          "bedtimeActive": false,
          "screenTimeExpired": false,
          "blockedPackagesCount": 0,
          "syncedAt": 0,
        ] as [String: Any]
      }
      return SentinelrEnforcementStore.getStateMap()
    }
  }
}
