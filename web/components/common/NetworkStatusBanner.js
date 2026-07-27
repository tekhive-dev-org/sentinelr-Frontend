import { useEffect, useRef, useState } from 'react';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useNetwork } from '../../context/NetworkContext';
import styles from './NetworkStatusBanner.module.css';

const RESTORED_MESSAGE_DURATION = 3500;

export default function NetworkStatusBanner() {
  const { status } = useNetwork();
  const previousStatusRef = useRef('unknown');
  const [isRestoredMessageVisible, setIsRestoredMessageVisible] = useState(false);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    if (previousStatus === 'offline' && status === 'online') {
      setIsRestoredMessageVisible(true);
      const timer = window.setTimeout(
        () => setIsRestoredMessageVisible(false),
        RESTORED_MESSAGE_DURATION,
      );

      return () => window.clearTimeout(timer);
    }

    if (status === 'offline') {
      setIsRestoredMessageVisible(false);
    }

    return undefined;
  }, [status]);

  if (status === 'unknown' || (status === 'online' && !isRestoredMessageVisible)) {
    return null;
  }

  const isOffline = status === 'offline';

  return (
    <div
      className={`${styles.banner} ${isOffline ? styles.offline : styles.online}`}
      role={isOffline ? 'alert' : 'status'}
      aria-live={isOffline ? 'assertive' : 'polite'}
    >
      {isOffline ? <WifiOffIcon aria-hidden="true" /> : <WifiIcon aria-hidden="true" />}
      <div>
        <strong>{isOffline ? 'You’re offline' : 'Back online'}</strong>
        <span>
          {isOffline
            ? ' Some features may be unavailable until your connection returns.'
            : ' Your connection has been restored.'}
        </span>
      </div>
    </div>
  );
}
