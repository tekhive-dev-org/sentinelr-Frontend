import LinkOffIcon from '@mui/icons-material/LinkOff';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './DeviceActions.module.css';

const ACTION_GROUPS = [
  {
    key: 'operations',
    label: 'Operations',
    items: [
      { key: 'revoke-session', label: 'Revoke Session', Icon: LinkOffIcon },
      { key: 'unpair-device', label: 'Unpair Device', Icon: LinkOffIcon },
      {
        key: 'flag-investigation',
        label: 'Flag for Investigation',
        Icon: ReportProblemOutlinedIcon,
      },
    ],
  },
  {
    key: 'support',
    label: 'Support',
    items: [
      {
        key: 'request-reauth',
        label: 'Request Re-authentication',
        Icon: LockResetOutlinedIcon,
      },
      { key: 'view-logs', label: 'View Logs', Icon: ArticleOutlinedIcon },
      { key: 'add-note', label: 'Add Note', Icon: NoteAddOutlinedIcon },
    ],
  },
];

const DANGER_ACTION_KEYS = new Set(['revoke-session', 'unpair-device']);

export default function DeviceActions({ device, onAction, isActionLoading }) {
  if (!device) return null;

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Device actions">
      {ACTION_GROUPS.map((group, groupIndex) => {
        if (group.items.length === 0) return null;

        return (
          <div key={group.key} className={styles.groupWrapper}>
            {groupIndex > 0 && (
              <div className={styles.divider} aria-hidden="true" />
            )}
            <div className={styles.group}>
              <span className={styles.groupLabel}>{group.label}</span>
              <div className={styles.buttons}>
                {group.items.map(({ key, label, Icon }) => {
                  const isLoading = isActionLoading === key;
                  const isDanger = DANGER_ACTION_KEYS.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.actionBtn} ${
                        isDanger ? styles.actionBtnDanger : ''
                      } ${isLoading ? styles.actionBtnLoading : ''}`}
                      onClick={() => onAction(key, device)}
                      disabled={isLoading}
                      aria-label={label}
                      aria-busy={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress
                          size={16}
                          className={styles.spinner}
                          aria-hidden="true"
                        />
                      ) : (
                        <Icon className={styles.icon} aria-hidden="true" />
                      )}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
