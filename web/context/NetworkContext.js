import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [status, setStatus] = useState('unknown');
  const [lastChangedAt, setLastChangedAt] = useState(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline');
      setLastChangedAt(new Date());
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const value = useMemo(
    () => ({
      status,
      isOnline: status === 'online',
      isOffline: status === 'offline',
      isNetworkKnown: status !== 'unknown',
      lastChangedAt,
    }),
    [status, lastChangedAt],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }

  return context;
}

export default NetworkContext;
