import SectionCard from '../users/SectionCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import styles from './AlertResolution.module.css';

export default function AlertResolution({ alert, isLoading }) {
  const isEmpty = !alert;
  const isResolved = alert?.status === 'resolved';
  const isFalseAlarm = alert?.status === 'false_alarm';
  const isActive =
    !isLoading && alert && alert.status !== 'resolved' && alert.status !== 'false_alarm';

  return (
    <SectionCard
      title="Resolution"
      icon={CheckCircleOutlineIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="Resolution information pending"
    >
      <div className={styles.content}>
        {isResolved && (
          <>
            {alert.resolutionNote && (
              <div className={styles.section}>
                <span className={styles.label}>Resolution Note</span>
                <p className={styles.resolutionNote}>
                  {alert.resolutionNote}
                </p>
              </div>
            )}

            <div className={styles.section}>
              <span className={styles.label}>Resolution Type</span>
              <span className={styles.resolutionType}>
                {alert.resolutionType || 'Resolved'}
              </span>
            </div>

            <div className={styles.section}>
              <span className={styles.value}>
                Resolved by{' '}
                <strong>
                  {alert.resolvedBy || '—'}
                </strong>
                {alert.resolvedAt && (
                  <>
                    {' on '}
                    {new Date(alert.resolvedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </>
                )}
              </span>
            </div>
          </>
        )}

        {isFalseAlarm && (
          <>
            {alert.falseAlarmReason && (
              <div className={styles.section}>
                <span className={styles.label}>Reason</span>
                <p className={styles.resolutionNote}>{alert.falseAlarmReason}</p>
              </div>
            )}

            <div className={styles.section}>
              <span className={styles.label}>Classification</span>
              <span className={styles.falseAlarmType}>False Alarm</span>
            </div>

            <div className={styles.section}>
              <span className={styles.value}>
                Marked by{' '}
                <strong>{alert.falseAlarmBy || '—'}</strong>
                {alert.falseAlarmAt && (
                  <>
                    {' on '}
                    {new Date(alert.falseAlarmAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </>
                )}
              </span>
            </div>
          </>
        )}

        {isActive && (
          <p className={styles.activeNotice}>Incident is still active</p>
        )}
      </div>
    </SectionCard>
  );
}
