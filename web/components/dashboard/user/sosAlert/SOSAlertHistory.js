import React, { useEffect, useMemo, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import styles from './SOSAlert.module.css';
import { TableSkeleton } from '../../../ui/loaders';

const STATUS_CLASSES = {
  resolved: styles.statusResolved,
  dismissed: styles.statusDismissed,
  cancelled: styles.statusDismissed,
  active: styles.statusActive,
  unresolved: styles.statusActive,
};

function formatDate(dateValue) {
  if (!dateValue) return 'Awaiting sync';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Awaiting sync';

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SOSAlertHistory({
  alerts = [],
  loading,
  pendingAction,
  onViewDetails,
  onCall,
  onCopySummary,
  onOpenMap,
  onResolve,
  onDismiss,
}) {
  const [search, setSearch] = useState('');
  const [menuState, setMenuState] = useState({ id: '', right: 0, top: 0, bottom: 'auto', flipUp: false });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest('[data-sos-row-menu]')) {
        setMenuState((prev) => ({ ...prev, id: '' }));
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, []);

  const handleMenuToggle = (alertId, event) => {
    if (menuState.id === alertId) {
      setMenuState((prev) => ({ ...prev, id: '' }));
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownHeight = 260;
    const flipUp = rect.bottom + dropdownHeight > window.innerHeight;
    setMenuState({
      id: alertId,
      right: window.innerWidth - rect.right,
      top: flipUp ? 'auto' : rect.bottom + 4,
      bottom: flipUp ? window.innerHeight - rect.top + 4 : 'auto',
      flipUp,
    });
  };

  const filteredAlerts = useMemo(() => {
    if (!search.trim()) return alerts;

    const query = search.toLowerCase();

    return alerts.filter((alert) => {
      return [
        alert.userName,
        alert.deviceName,
        alert.locationLabel,
        alert.triggerLabel,
        alert.incidentCode,
        alert.statusLabel,
      ].some((value) => (value || '').toLowerCase().includes(query));
    });
  }, [alerts, search]);

  const activeMenuAlert = isMobile && menuState.id
    ? filteredAlerts.find((a) => a.id === menuState.id) ?? null
    : null;
  const activeCanUpdate = activeMenuAlert
    ? (activeMenuAlert.status === 'active' || activeMenuAlert.status === 'unresolved')
    : false;
  const activeIsResolving = activeMenuAlert ? pendingAction === `resolve:${activeMenuAlert.id}` : false;
  const activeIsDismissing = activeMenuAlert ? pendingAction === `dismiss:${activeMenuAlert.id}` : false;

  return (
    <div className={styles.historySection}>
      <div className={styles.historyHeader}>
        <div>
          <h2 className={styles.historyTitle}>Recent Alert History</h2>
          <p className={styles.historySubtitle}>Every incident stays actionable from the table, including audit-ready details and response actions.</p>
        </div>

        <div className={styles.searchWrapper}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search member, device, incident, or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : filteredAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            {search ? 'No incidents match the current search.' : 'No incident history is available yet.'}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Incident</th>
                <th>Triggered</th>
                <th>Last known location</th>
                <th>Device</th>
                <th>Status</th>
                <th aria-label="Row actions"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const statusClass = STATUS_CLASSES[alert.status] || styles.statusActive;
                const isResolving = pendingAction === `resolve:${alert.id}`;
                const isDismissing = pendingAction === `dismiss:${alert.id}`;
                const canUpdateIncident = alert.status === 'active' || alert.status === 'unresolved';

                return (
                  <tr key={alert.id}>
                    <td>
                      <div className={styles.memberCell}>
                        <div className={styles.memberAvatar}>
                          {(alert.userName || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div className={styles.memberCellText}>
                          <strong className={styles.memberName}>{alert.userName}</strong>
                          <span className={styles.memberMeta}>{alert.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.incidentCell}>
                        <strong className={styles.incidentTitle}>{alert.title}</strong>
                        <span className={styles.incidentMeta}>{alert.incidentCode} · {alert.triggerLabel}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.incidentCell}>
                        <strong className={styles.incidentTitle}>{formatDate(alert.createdAt)}</strong>
                        <span className={styles.incidentMeta}>{alert.responseClock} response clock</span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.locationMapBtn}
                        onClick={() => onOpenMap(alert)}
                        title="Open map"
                      >
                        <strong className={styles.locationPrimary}>{alert.locationLabel}</strong>
                        <span className={styles.locationMapHint}>View on map →</span>
                      </button>
                    </td>
                    <td>
                      <div className={styles.deviceCell}>
                        <strong className={styles.devicePrimary}>{alert.deviceName}</strong>
                        <span className={styles.deviceSecondary}>{alert.deviceType}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        <span className={styles.statusDot} />
                        {alert.statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowMenuWrapper} data-sos-row-menu>
                        <button
                          type="button"
                          className={styles.rowMenuBtn}
                          aria-label={`More actions for ${alert.userName}`}
                          onClick={(e) => handleMenuToggle(alert.id, e)}
                        >
                          <MoreVertIcon className={styles.rowMenuIcon} />
                        </button>

                        {!isMobile && menuState.id === alert.id && (
                          <div
                            className={styles.rowMenuDropdown}
                            style={{
                              right: menuState.right,
                              top: menuState.top,
                              bottom: menuState.bottom,
                            }}
                            data-sos-row-menu
                          >
                            <button type="button" className={styles.rowMenuItem} onClick={() => {
                              setMenuState((prev) => ({ ...prev, id: '' }));
                              onViewDetails(alert);
                            }}>
                              View details
                            </button>
                            <button type="button" className={styles.rowMenuItem} onClick={() => {
                              setMenuState((prev) => ({ ...prev, id: '' }));
                              onCall(alert);
                            }}>
                              Call contact
                            </button>
                            <button type="button" className={styles.rowMenuItem} onClick={() => {
                              setMenuState((prev) => ({ ...prev, id: '' }));
                              onOpenMap(alert);
                            }}>
                              Open map
                            </button>
                            <button type="button" className={styles.rowMenuItem} onClick={() => {
                              setMenuState((prev) => ({ ...prev, id: '' }));
                              onCopySummary(alert);
                            }}>
                              Copy incident brief
                            </button>
                            {canUpdateIncident && (
                              <button
                                type="button"
                                className={styles.rowMenuItem}
                                onClick={() => {
                                  setMenuState((prev) => ({ ...prev, id: '' }));
                                  onResolve(alert);
                                }}
                                disabled={isResolving || isDismissing}
                              >
                                {isResolving ? 'Resolving…' : 'Mark resolved'}
                              </button>
                            )}
                            {canUpdateIncident && (
                              <button
                                type="button"
                                className={`${styles.rowMenuItem} ${styles.rowMenuDanger}`}
                                onClick={() => {
                                  setMenuState((prev) => ({ ...prev, id: '' }));
                                  onDismiss(alert);
                                }}
                                disabled={isResolving || isDismissing}
                              >
                                {isDismissing ? 'Dismissing…' : 'Dismiss alert'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isMobile && activeMenuAlert && (
        <>
          <div
            className={styles.rowMenuOverlay}
            onClick={() => setMenuState((prev) => ({ ...prev, id: '' }))}
          />
          <div className={styles.rowMenuBottomSheet} data-sos-row-menu>
            <div className={styles.bottomSheetHandle} />
            <p className={styles.bottomSheetTitle}>{activeMenuAlert.userName}</p>
            <button type="button" className={styles.rowMenuItem} onClick={() => { setMenuState((p) => ({ ...p, id: '' })); onViewDetails(activeMenuAlert); }}>
              View details
            </button>
            <button type="button" className={styles.rowMenuItem} onClick={() => { setMenuState((p) => ({ ...p, id: '' })); onCall(activeMenuAlert); }}>
              Call contact
            </button>
            <button type="button" className={styles.rowMenuItem} onClick={() => { setMenuState((p) => ({ ...p, id: '' })); onOpenMap(activeMenuAlert); }}>
              Open map
            </button>
            <button type="button" className={styles.rowMenuItem} onClick={() => { setMenuState((p) => ({ ...p, id: '' })); onCopySummary(activeMenuAlert); }}>
              Copy incident brief
            </button>
            {activeCanUpdate && (
              <button
                type="button"
                className={styles.rowMenuItem}
                onClick={() => { setMenuState((p) => ({ ...p, id: '' })); onResolve(activeMenuAlert); }}
                disabled={activeIsResolving || activeIsDismissing}
              >
                {activeIsResolving ? 'Resolving…' : 'Mark resolved'}
              </button>
            )}
            {activeCanUpdate && (
              <button
                type="button"
                className={`${styles.rowMenuItem} ${styles.rowMenuDanger}`}
                onClick={() => { setMenuState((p) => ({ ...p, id: '' })); onDismiss(activeMenuAlert); }}
                disabled={activeIsResolving || activeIsDismissing}
              >
                {activeIsDismissing ? 'Dismissing…' : 'Dismiss alert'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
