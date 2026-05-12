package expo.modules.sentinelrparentalcontrols

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SentinelrParentalControlsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SentinelrParentalControls")

    Function("isAccessibilityServiceEnabled") {
      SentinelrEnforcementStore.isAccessibilityServiceEnabled(requireContext())
    }

    Function("openAccessibilitySettings") {
      SentinelrEnforcementStore.openAccessibilitySettings(requireContext())
    }

    Function("applyControls") { payload: Map<String, Any?> ->
      SentinelrEnforcementStore.savePayload(requireContext(), payload)
      true
    }

    Function("clearControls") {
      SentinelrEnforcementStore.clear(requireContext())
      true
    }

    Function("getEnforcementState") {
      SentinelrEnforcementStore.getStateMap(requireContext())
    }
  }

  private fun requireContext() =
    appContext.reactContext?.applicationContext
      ?: throw IllegalStateException("React context is not available")
}
