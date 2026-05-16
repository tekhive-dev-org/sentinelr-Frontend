const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Removes android:screenOrientation restrictions from third-party activities
 * that cannot be configured through Expo's standard API.
 *
 * For activities from library manifests (e.g. MLKit), we inject an override
 * entry with tools:replace so Gradle's manifest merger uses our attributes
 * (no screenOrientation) instead of the library's declaration.
 *
 * Required for Android 16 large-screen / foldable compatibility.
 */
const ACTIVITIES_TO_UNLOCK = [
  'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity',
];

module.exports = (config) =>
  withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults?.manifest;
    if (!manifest) return modConfig;

    // Ensure the tools namespace is present so tools:replace is valid
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const app = manifest.application?.[0];
    if (!app) return modConfig;
    if (!app.activity) app.activity = [];

    for (const activityName of ACTIVITIES_TO_UNLOCK) {
      const existing = app.activity.find(
        (a) => a.$?.['android:name'] === activityName,
      );
      if (existing) {
        // Strip screenOrientation and use tools:remove so merger drops the library's declaration
        const { 'android:screenOrientation': _removed, ...attrs } = existing.$;
        existing.$ = { ...attrs, 'tools:remove': 'android:screenOrientation' };
      } else {
        // No existing entry — inject one so the Gradle merge drops the library's screenOrientation
        app.activity.push({
          $: {
            'android:name': activityName,
            'tools:remove': 'android:screenOrientation',
          },
        });
      }
    }

    return modConfig;
  });
