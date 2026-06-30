/**
 * RealtimeSubscriptionContext (Mobile)
 *
 * React context + provider that wraps the centralized realtime service.
 * Components use convenience hooks to subscribe to table changes.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import {
  subscribeToDevices as svcSubscribeDevices,
  subscribeToAlerts as svcSubscribeAlerts,
  subscribeToLocations as svcSubscribeLocations,
  getConnectionStatus as svcGetStatus,
  destroyAll,
} from '../services/realtimeSubscriptionService';

const RealtimeSubscriptionContext = createContext(null);

export function RealtimeSubscriptionProvider({ children }) {
  const providerValue = useRef({
    subscribeToDevices: svcSubscribeDevices,
    subscribeToAlerts: svcSubscribeAlerts,
    subscribeToLocations: svcSubscribeLocations,
    getConnectionStatus: svcGetStatus,
  });

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
 * Convenience hook: subscribes to Devices changes.
 * If deviceId is null/undefined, no subscription is created.
 */
export function useDevicesSubscription(onData, { deviceId, event = '*' } = {}, deps = []) {
  const { subscribeToDevices } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    if (!deviceId) return;
    const unsubscribe = subscribeToDevices(
      (payload) => { onDataRef.current(payload); },
      { event, deviceId },
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToDevices, deviceId, event, ...deps]);
}

/**
 * Convenience hook: subscribes to Alerts changes.
 */
export function useAlertsSubscription(onData, { event = '*' } = {}, deps = []) {
  const { subscribeToAlerts } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const unsubscribe = subscribeToAlerts(
      (payload) => { onDataRef.current(payload); },
      { event },
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToAlerts, event, ...deps]);
}

/**
 * Convenience hook: subscribes to new Locations inserts.
 * If deviceId is null/undefined, no subscription is created.
 */
export function useLocationsSubscription(onData, { deviceId } = {}, deps = []) {
  const { subscribeToLocations } = useRealtimeSubscription();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    if (!deviceId) return;
    const unsubscribe = subscribeToLocations(
      (payload) => { onDataRef.current(payload); },
      { deviceId },
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToLocations, deviceId, ...deps]);
}

export default RealtimeSubscriptionContext;
