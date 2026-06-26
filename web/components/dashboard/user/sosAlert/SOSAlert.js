import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SOSAlertBanner from './SOSAlertBanner';
import SOSAlertMap from './SOSAlertMap';
import SOSAlertHistory from './SOSAlertHistory';
import SOSAlertIncidentModal from './SOSAlertIncidentModal';
import Toast from '../../../common/Toast';
import styles from './SOSAlert.module.css';
import { useSOSAlert } from './hooks/useSOSAlert';

export default function SOSAlert() {
  const {
    activeAlert,
    allAlerts,
    selectedAlert,
    setSelectedAlert,
    loading,
    toast,
    pendingAction,
    realtimeStatus,
    dashboardStats,
    handleCall,
    handleCopySummary,
    handleOpenMap,
    handleResolve,
    handleDismiss,
  } = useSOSAlert();

  return (
    <div className={styles.container}>
      <div className={styles.commandHeader}>
        <div>
          <div className={styles.commandEyebrowRow}>
            <span className={styles.commandEyebrow}>Emergency operations</span>
            <span className={`${styles.realtimeBadge} ${realtimeStatus === 'live' ? styles.realtimeLive : realtimeStatus === 'polling' ? styles.realtimePolling : styles.realtimeConnecting}`}>
              {realtimeStatus === 'live' ? 'Live' : realtimeStatus === 'polling' ? 'Polling' : 'Connecting…'}
            </span>
          </div>
          <h1 className={styles.commandTitle}>SOS Command Center</h1>
          <p className={styles.commandSubtitle}>
            Monitor live distress events, validate member context, and act on incidents from one operational view.
          </p>
        </div>

        <div className={styles.commandStats}>
          {dashboardStats.map((stat) => {
            const StatIcon = stat.icon;

            return (
              <div key={stat.label} className={styles.commandStatCard}>
                <div className={styles.commandStatIcon}>
                  <StatIcon style={{ fontSize: 18 }} />
                </div>
                <div className={styles.commandStatCopy}>
                  <span className={styles.commandStatLabel}>{stat.label}</span>
                  <strong className={styles.commandStatValue}>{stat.value}</strong>
                  <span className={styles.commandStatMeta}>{stat.meta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.contentPad}>
        {activeAlert ? (
          <div className={styles.topSection}>
            <SOSAlertBanner
              alert={activeAlert}
              pendingAction={pendingAction}
              onCall={handleCall}
              onCopySummary={handleCopySummary}
              onOpenMap={handleOpenMap}
              onResolve={handleResolve}
              onDismiss={handleDismiss}
            />
            <SOSAlertMap alert={activeAlert} onOpenMap={handleOpenMap} onViewDetails={setSelectedAlert} />
          </div>
        ) : (
          <div className={styles.topSection}>
            <div className={styles.noAlertCard}>
              <div className={styles.noAlertIcon}>
                <CheckCircleOutlineIcon />
              </div>
              <h3 className={styles.noAlertTitle}>No Active SOS Incidents</h3>
              <p className={styles.noAlertDesc}>
                The response queue is clear. Historical incidents remain available below for audit, follow-up, and export.
              </p>
            </div>
          </div>
        )}

        <SOSAlertHistory
          alerts={allAlerts}
          loading={loading}
          pendingAction={pendingAction}
          onViewDetails={setSelectedAlert}
          onCall={handleCall}
          onCopySummary={handleCopySummary}
          onOpenMap={handleOpenMap}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
        />
      </div>

      <SOSAlertIncidentModal
        alert={selectedAlert}
        isOpen={Boolean(selectedAlert)}
        pendingAction={pendingAction}
        onClose={() => setSelectedAlert(null)}
        onCall={handleCall}
        onCopySummary={handleCopySummary}
        onOpenMap={handleOpenMap}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
