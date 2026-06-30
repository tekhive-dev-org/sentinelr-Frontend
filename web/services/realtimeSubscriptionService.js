/**
 * Centralized Real-time Subscription Service
 *
 * Manages ALL Supabase real-time channels in one place.
 * Components and hooks register listeners for specific table changes
 * rather than each creating their own channels.
 *
 * Tables subscribed:
 *   - ParentalControls          → INSERT / UPDATE / DELETE
 *   - ParentalControlActivities → INSERT
 *   - Alerts                    → INSERT / UPDATE
 *   - Locations                 → INSERT
 *   - Devices                   → INSERT / UPDATE / DELETE
 *   - FamilyMembers             → INSERT / UPDATE / DELETE
 */

import { supabase } from './supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} SubscriptionConfig
 * @property {string} table - PostgreSQL table name (e.g. 'ParentalControls', 'Alerts')
 * @property {'INSERT'|'UPDATE'|'DELETE'|'*'} [event] - Filter by event type, '*' for all
 * @property {string} [filter] - Optional Supabase realtime filter expression (e.g. 'deviceId=eq.123')
 * @property {Function} callback - Called with the change payload
 */

/**
 * @typedef {Object} ActiveListener
 * @property {string} id - Unique listener ID
 * @property {SubscriptionConfig} config
 */

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {ActiveListener[]} */
let listeners = [];
let channel = null;
let isConnecting = false;
let connectionStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'live' | 'polling'
let reconnectTimer = null;
let reconnectDelay = 1000; // starts at 1s, doubles each retry up to 30s

/** @type {Array<Function>} */
let statusChangeCallbacks = [];

// ─── Channel Management ───────────────────────────────────────────────────────

function scheduleReconnect() {
  if (reconnectTimer) return;
  // Skip reconnect if channel was already recreated by another subscribe() call
  if (channel) return;
  console.log(`[RealtimeSubscription] Scheduling reconnect in ${reconnectDelay}ms`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (listeners.length > 0 && !channel) {
      getOrCreateChannel();
    }
  }, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, 30000); // exponential backoff, max 30s
}

function getOrCreateChannel() {
  if (channel) return channel;

  isConnecting = true;
  connectionStatus = 'connecting';
  notifyStatusChange();

  channel = supabase
    .channel('sentinelr-realtime', {
      config: {
        broadcast: { self: true },
      },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ParentalControls' },
      (payload) => dispatchEvent('ParentalControls', payload.eventType, payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ParentalControlActivities' },
      (payload) => dispatchEvent('ParentalControlActivities', payload.eventType, payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Alerts' },
      (payload) => dispatchEvent('Alerts', payload.eventType, payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Locations' },
      (payload) => dispatchEvent('Locations', payload.eventType, payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Devices' },
      (payload) => dispatchEvent('Devices', payload.eventType, payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'FamilyMembers' },
      (payload) => dispatchEvent('FamilyMembers', payload.eventType, payload),
    )
    .subscribe((status) => {
      console.log('[RealtimeSubscription] Channel status:', status);
      if (status === 'SUBSCRIBED') {
        connectionStatus = 'live';
        isConnecting = false;
        reconnectDelay = 1000; // reset backoff on successful connection
        console.log('[RealtimeSubscription] Channel live — real-time events active');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        connectionStatus = 'polling';
        isConnecting = false;
        // Clear the broken channel so it will be recreated on next subscribe()
        console.warn('[RealtimeSubscription] Channel error — clearing for reconnect');
        channel = null;
        scheduleReconnect();
      } else if (status === 'CLOSED') {
        connectionStatus = 'disconnected';
        channel = null;
        isConnecting = false;
        scheduleReconnect();
      }
      notifyStatusChange();
    });

  return channel;
}

// ─── Event Dispatch ───────────────────────────────────────────────────────────

/**
 * Routes a real-time payload from any table to all matching listeners.
 * Supports optional client-side filter matching via listener config.filter.
 */
function dispatchEvent(table, eventType, payload) {
  // Debug: log every event received so we can diagnose real-time issues
  console.log(
    `[RealtimeSubscription] Event received: table=${table} event=${eventType}`,
    'payload.new=', payload.new,
    'listenerCount=', listeners.filter(l => l.config.table === table).length,
  );

  const matching = listeners.filter((listener) => {
    const cfg = listener.config;
    if (cfg.table !== table) return false;
    if (cfg.event && cfg.event !== '*' && cfg.event !== eventType) return false;
    // Client-side filter: e.g. 'deviceId=eq.123'
    if (cfg.filter && payload.new) {
      const [col, op, val] = parseFilter(cfg.filter);
      if (col && op) {
        const rowVal = String(payload.new[col] ?? '');
        if (op === 'eq' && rowVal !== val) return false;
      }
    }
    return true;
  });

  for (const listener of matching) {
    try {
      listener.config.callback(payload);
    } catch (err) {
      console.error(`[RealtimeSubscription] Listener error for ${table}/${eventType}:`, err);
    }
  }
}

/**
 * Parses a Supabase realtime filter string like 'deviceId=eq.123'
 * into [column, operator, value].
 */
function parseFilter(filter) {
  if (!filter) return [null, null, null];
  const match = filter.match(/^(\w+)=(\w+)\.(.+)$/);
  if (!match) return [null, null, null];
  return [match[1], match[2], match[3]];
}

// ─── Status ───────────────────────────────────────────────────────────────────

function notifyStatusChange() {
  const cbs = [...statusChangeCallbacks];
  for (const cb of cbs) {
    try {
      cb(connectionStatus);
    } catch {}
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a listener for changes on a specific table.
 *
 * @param {SubscriptionConfig} config
 * @returns {() => void} Unsubscribe function
 */
export function subscribe(config) {
  const id = `${config.table}_${config.event || '*'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  listeners.push({ id, config });

  // Ensure channel is active
  getOrCreateChannel();

  return () => {
    listeners = listeners.filter((l) => l.id !== id);
    // Channel stays alive — don't tear it down just because one listener unsubscribes.
    // It will be cleaned up by destroyAll() on logout. Tearing down the channel on
    // every listener unsubscribe causes CLOSE→reconnect loops with React StrictMode.
  };
}

/**
 * Subscribe to changes on the ParentalControls table.
 *
 * @param {Function} callback - (payload) => void
 * @param {Object} [options]
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} [options.event='*']
 * @returns {() => void} Unsubscribe
 */
export function subscribeToParentalControls(callback, { event = '*' } = {}) {
  return subscribe({ table: 'ParentalControls', event, callback });
}

/**
 * Subscribe to ParentalControlActivities changes.
 *
 * @param {Function} callback - (payload) => void
 * @param {Object} [options]
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} [options.event='*']
 * @returns {() => void} Unsubscribe
 */
export function subscribeToParentalControlActivities(callback, { event = '*' } = {}) {
  return subscribe({ table: 'ParentalControlActivities', event, callback });
}

/**
 * Subscribe to changes on the Alerts table.
 *
 * @param {Function} callback - (payload) => void
 * @param {Object} [options]
 * @param {'INSERT'|'UPDATE'|'*'} [options.event='*']
 * @returns {() => void} Unsubscribe
 */
export function subscribeToAlerts(callback, { event = '*' } = {}) {
  return subscribe({ table: 'Alerts', event, callback });
}

/**
 * Subscribe to Locations changes, optionally filtered by deviceId.
 *
 * @param {Function} callback - (payload) => void
 * @param {Object} [options]
 * @param {string} [options.deviceId] - Optional device ID filter
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} [options.event='*']
 * @returns {() => void} Unsubscribe
 */
export function subscribeToLocations(callback, { deviceId, event = '*' } = {}) {
  const filter = deviceId ? `deviceId=eq.${deviceId}` : undefined;
  return subscribe({ table: 'Locations', event, filter, callback });
}

/**
 * Subscribe to changes on the Devices table.
 *
 * @param {Function} callback - (payload) => void
 * @param {Object} [options]
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} [options.event='*']
 * @returns {() => void} Unsubscribe
 */
export function subscribeToDevices(callback, { event = '*' } = {}) {
  return subscribe({ table: 'Devices', event, callback });
}

/**
 * Subscribe to changes on the FamilyMembers table, optionally filtered by familyId.
 *
 * @param {Function} callback - (payload) => void
 * @param {Object} [options]
 * @param {string} [options.familyId] - Optional family ID filter
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} [options.event='*']
 * @returns {() => void} Unsubscribe
 */
export function subscribeToFamilyMembers(callback, { event = '*', familyId } = {}) {
  const filter = familyId ? `familyId=eq.${familyId}` : undefined;
  return subscribe({ table: 'FamilyMembers', event, filter, callback });
}

/**
 * Get the current connection status.
 * @returns {'disconnected' | 'connecting' | 'live' | 'polling'}
 */
export function getConnectionStatus() {
  return connectionStatus;
}

/**
 * Listen to connection status changes.
 * @param {Function} callback - (status: string) => void
 * @returns {() => void} Unsubscribe
 */
export function onStatusChange(callback) {
  statusChangeCallbacks.push(callback);
  // Immediately notify with current status
  callback(connectionStatus);
  return () => {
    statusChangeCallbacks = statusChangeCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Tear down all subscriptions and the underlying channel.
 * Useful on logout or when unmounting the provider.
 */
export function destroyAll() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  listeners = [];
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
  connectionStatus = 'disconnected';
  statusChangeCallbacks = [];
  reconnectDelay = 1000;
}

export default {
  subscribe,
  subscribeToParentalControls,
  subscribeToParentalControlActivities,
  subscribeToAlerts,
  subscribeToLocations,
  subscribeToDevices,
  subscribeToFamilyMembers,
  getConnectionStatus,
  onStatusChange,
  destroyAll,
};
