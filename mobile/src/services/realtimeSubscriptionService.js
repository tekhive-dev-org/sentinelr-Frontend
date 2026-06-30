/**
 * Centralized Real-time Subscription Service (Mobile)
 *
 * Manages ALL Supabase real-time channels in one place.
 * Components and hooks register listeners for specific table changes
 * rather than each creating their own channels.
 */

import { getSupabase } from './supabaseClient';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {Array<{id: string, config: object}>} */
let listeners = [];
let channel = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'live' | 'error'

/** @type {Array<Function>} */
let statusChangeCallbacks = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFilter(filter) {
  if (!filter) return [null, null, null];
  const match = filter.match(/^(\w+)=(\w+)\.(.+)$/);
  if (!match) return [null, null, null];
  return [match[1], match[2], match[3]];
}

function dispatchEvent(table, eventType, payload) {
  const matching = listeners.filter((listener) => {
    const cfg = listener.config;
    if (cfg.table !== table) return false;
    if (cfg.event && cfg.event !== '*' && cfg.event !== eventType) return false;
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

function notifyStatusChange() {
  const cbs = [...statusChangeCallbacks];
  for (const cb of cbs) {
    try { cb(connectionStatus); } catch {}
  }
}

// ─── Channel Management ───────────────────────────────────────────────────────

function getOrCreateChannel() {
  if (channel) return channel;

  const supabase = getSupabase();
  if (!supabase) return null;

  connectionStatus = 'connecting';
  notifyStatusChange();

  channel = supabase
    .channel('sentinelr-mobile-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Devices' },
      (payload) => dispatchEvent('Devices', payload.eventType, payload),
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'Alerts' },
      (payload) => dispatchEvent('Alerts', 'INSERT', payload),
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'Locations' },
      (payload) => dispatchEvent('Locations', 'INSERT', payload),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        connectionStatus = 'live';
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        connectionStatus = 'error';
      } else if (status === 'CLOSED') {
        connectionStatus = 'disconnected';
        channel = null;
      }
      notifyStatusChange();
    });

  return channel;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a listener for changes on a specific table.
 *
 * @param {{ table: string, event?: string, filter?: string, callback: Function }} config
 * @returns {() => void} Unsubscribe function
 */
export function subscribe(config) {
  const id = `${config.table}_${config.event || '*'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  listeners.push({ id, config });
  getOrCreateChannel();

  return () => {
    listeners = listeners.filter((l) => l.id !== id);
    if (listeners.length === 0 && channel) {
      const supabase = getSupabase();
      if (supabase) supabase.removeChannel(channel);
      channel = null;
      connectionStatus = 'disconnected';
      notifyStatusChange();
    }
  };
}

/**
 * Subscribe to changes on the Devices table.
 */
export function subscribeToDevices(callback, { event = '*', deviceId } = {}) {
  const filter = deviceId ? `id=eq.${deviceId}` : undefined;
  return subscribe({ table: 'Devices', event, filter, callback });
}

/**
 * Subscribe to new Alerts.
 */
export function subscribeToAlerts(callback, { event = '*' } = {}) {
  return subscribe({ table: 'Alerts', event, callback });
}

/**
 * Subscribe to new Locations inserts, optionally filtered by deviceId.
 */
export function subscribeToLocations(callback, { deviceId } = {}) {
  const filter = deviceId ? `deviceId=eq.${deviceId}` : undefined;
  return subscribe({ table: 'Locations', event: 'INSERT', filter, callback });
}

/**
 * Get the current connection status.
 */
export function getConnectionStatus() {
  return connectionStatus;
}

/**
 * Listen to connection status changes.
 */
export function onStatusChange(callback) {
  statusChangeCallbacks.push(callback);
  callback(connectionStatus);
  return () => {
    statusChangeCallbacks = statusChangeCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Tear down all subscriptions.
 */
export function destroyAll() {
  listeners = [];
  if (channel) {
    const supabase = getSupabase();
    if (supabase) supabase.removeChannel(channel);
    channel = null;
  }
  connectionStatus = 'disconnected';
  statusChangeCallbacks = [];
}

export default {
  subscribe,
  subscribeToDevices,
  subscribeToAlerts,
  subscribeToLocations,
  getConnectionStatus,
  onStatusChange,
  destroyAll,
};
