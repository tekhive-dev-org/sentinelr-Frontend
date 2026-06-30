/**
 * RealtimeSubscriptionContext
 *
 * React context + provider that wraps the centralized realtime service.
 * Components use the `useRealtimeSubscription` hook to subscribe to table changes.
 *
 * Usage:
 *   Wrap your app/dashboard with <RealtimeSubscriptionProvider>
 *   Then in any component:
 *     const { subscribeToAlerts, connectionStatus } = useRealtimeSubscription();
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import {
  subscribeToParentalControls as svcSubscribePC,
  subscribeToParentalControlActivities as svcSubscribePCA,
  subscribeToAlerts as svcSubscribeAlerts,
  subscribeToLocations as svcSubscribeLocations,
  subscribeToDevices as svcSubscribeDevices,
  subscribeToFamilyMembers as svcSubscribeFamilyMembers,
  getConnectionStatus as svcGetStatus,
  destroyAll,
} from '../services/realtimeSubscriptionService';

const RealtimeSubscriptionContext = createContext(null);

export function RealtimeSubscriptionProvider({ children }) {
  const providerValue = useRef({
    subscribeToParentalControls: svcSubscribePC,
    subscribeToParentalControlActivities: svcSubscribePCA,
    subscribeToAlerts: svcSubscribeAlerts,
    subscribeToLocations: svcSubscribeLocations,
    subscribeToDevices: svcSubscribeDevices,
    subscribeToFamilyMembers: svcSubscribeFamilyMembers,
    getConnectionStatus: svcGetStatus,
  });

  // Tear down the channel on unmount (e.g., logout)
  useEffect(() => {
    return () => {
      destroyAll();
    };
  }, []);

  return (
    <RealtimeSubscriptionContext.Provider value={providerValue.current}>
      {children}
    </RealtimeSubscriptionContext.Provider>
  );
}

/**
 * Hook to access the centralized realtime subscription service.
 *
 * @returns {{
 *   subscribeToParentalControls: (callback, options?) => (() => void),
 *   subscribeToParentalControlActivities: (callback) => (() => void),
 *   subscribeToAlerts: (callback, options?) => (() => void),
 *   getConnectionStatus: () => string,
 * }}
 */
export function useRealtimeSubscription() {
  const ctx = useContext(RealtimeSubscriptionContext);
  if (!ctx) {
    throw new Error(
      'useRealtimeSubscription must be used within a <RealtimeSubscriptionProvider>',
    );
  }
  return ctx;
}

/**
 * Convenience hook: subscribes to ParentalControls changes for the lifetime
 * of the component and calls onData whenever new data arrives.
 *
 * @param {Function} onData - Called with the Supabase change payload
 * @param {Object} [deps] - Dependency array controlling re-subscription
 */
export function useParentalControlsSubscription(onData, deps = []) {
  const { subscribeToParentalControls } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToParentalControls((payload) => {
      onDataRef.current(payload);
    }, { event: '*' });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToParentalControls, ...deps]);
}

/**
 * Convenience hook: subscribes to ParentalControlActivities changes.
 *
 * @param {Function} onData - Called with the Supabase change payload
 * @param {Object} [deps] - Dependency array controlling re-subscription
 */
export function useParentalControlActivitiesSubscription(onData, deps = []) {
  const { subscribeToParentalControlActivities } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToParentalControlActivities((payload) => {
      onDataRef.current(payload);
    }, { event: '*' });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToParentalControlActivities, ...deps]);
}

/**
 * Convenience hook: subscribes to Alerts changes.
 *
 * @param {Function} onData - Called with the Supabase change payload
 * @param {Object} [deps] - Dependency array controlling re-subscription
 */
export function useAlertsSubscription(onData, deps = []) {
  const { subscribeToAlerts } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToAlerts((payload) => {
      onDataRef.current(payload);
    }, { event: '*' });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToAlerts, ...deps]);
}

/**
 * Convenience hook: subscribes to Locations changes, optionally filtered by deviceId.
 *
 * @param {Function} onData - Called with the Supabase change payload
 * @param {Object} [options]
 * @param {string} [options.deviceId] - Optional device ID filter
 * @param {Object} [deps] - Dependency array controlling re-subscription
 */
export function useLocationsSubscription(onData, options = {}, deps = []) {
  const { subscribeToLocations } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToLocations((payload) => {
      onDataRef.current(payload);
    }, { event: '*', deviceId: options.deviceId });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToLocations, options.deviceId, ...deps]);
}

/**
 * Convenience hook: subscribes to Devices changes.
 *
 * @param {Function} onData - Called with the Supabase change payload
 * @param {Object} [deps] - Dependency array controlling re-subscription
 */
export function useDevicesSubscription(onData, deps = []) {
  const { subscribeToDevices } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToDevices((payload) => {
      onDataRef.current(payload);
    }, { event: '*' });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToDevices, ...deps]);
}

/**
 * Convenience hook: subscribes to FamilyMembers changes, optionally filtered by familyId.
 *
 * @param {Function} onData - Called with the Supabase change payload
 * @param {Object} [options]
 * @param {string} [options.familyId] - Optional family ID filter
 * @param {Object} [deps] - Dependency array controlling re-subscription
 */
export function useFamilyMembersSubscription(onData, options = {}, deps = []) {
  const { subscribeToFamilyMembers } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToFamilyMembers((payload) => {
      onDataRef.current(payload);
    }, { event: '*', familyId: options.familyId });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToFamilyMembers, options.familyId, ...deps]);
}

export default RealtimeSubscriptionContext;
