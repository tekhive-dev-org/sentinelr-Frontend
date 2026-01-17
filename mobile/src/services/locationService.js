import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiService } from './api';
import { storageService } from './storageService';

const LOCATION_TASK_NAME = 'sentinelr-background-location';

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[Location Task] Error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    
    for (const location of locations) {
      const { latitude, longitude, accuracy, altitude, speed } = location.coords;
      
      try {
        // Check if device is still paired
        const isPaired = await storageService.isPaired();
        const isTracking = await storageService.isTrackingEnabled();
        
        if (isPaired && isTracking) {
          await apiService.uploadPing({
            latitude,
            longitude,
            accuracy,
            altitude,
            speed,
            timestamp: new Date(location.timestamp).toISOString(),
            source: 'background',
          });
          console.log('[Location Task] Ping uploaded successfully');
        }
      } catch (uploadError) {
        console.error('[Location Task] Failed to upload ping:', uploadError);
        // TODO: Queue for retry when online
      }
    }
  }
});

export const locationService = {
  /**
   * Check if background tracking is running
   */
  async isRunning() {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  },

  /**
   * Start background location tracking
   */
  async start() {
    // Check permissions first
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    const { status: background } = await Location.getBackgroundPermissionsAsync();

    if (foreground !== 'granted' || background !== 'granted') {
      throw new Error('Location permissions not granted');
    }

    // Check if already running
    const isRunning = await this.isRunning();
    if (isRunning) {
      console.log('[Location Service] Already running');
      return;
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // meters
      timeInterval: 30000, // 30 seconds
      deferredUpdatesInterval: 60000, // 1 minute batch
      deferredUpdatesDistance: 50, // 50 meters batch
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Sentinelr',
        notificationBody: 'Location tracking is active',
        notificationColor: '#db323f',
      },
      pausesUpdatesAutomatically: false,
    });

    // Mark as enabled in storage
    await storageService.setTrackingEnabled(true);
    console.log('[Location Service] Started background tracking');
  },

  /**
   * Stop background location tracking
   */
  async stop() {
    const isRunning = await this.isRunning();
    
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('[Location Service] Stopped background tracking');
    }

    await storageService.setTrackingEnabled(false);
  },

  /**
   * Get current location once
   */
  async getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date(location.timestamp).toISOString(),
    };
  },
};
