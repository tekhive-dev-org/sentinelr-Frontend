import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './AlertActions.module.css';

const ACTIVE_ACTIONS = [
  { key: 'acknowledge', label: 'Acknowledge', Icon: CheckCircleOutlineIcon },
  { key: 'assign', label: 'Assign', Icon: AssignmentIndIcon },
  { key: 'escalate', label: 'Escalate', Icon: ArrowUpwardIcon },
  { key: 'add-note', label: 'Add Note', Icon: NoteAddOutlinedIcon },
  { key: 'record-contact', label: 'Record Contact', Icon: ContactPhoneIcon },
];

const DANGER_ACTIONS = [
  { key: 'mark-false-alarm', label: 'Mark False Alarm', Icon: GppBadOutlinedIcon },
  { key: 'resolve', label: 'Resolve', Icon: CheckCircleIcon },
];

const ACKNOWLEDGED_ACTIONS = [
  { key: 'assign', label: 'Assign', Icon: AssignmentIndIcon },
  { key: 'escalate', label: 'Escalate', Icon: ArrowUpwardIcon },
  { key: 'add-note', label: 'Add Note', Icon: NoteAddOutlinedIcon },
  { key: 'record-contact', label: 'Record Contact', Icon: ContactPhoneIcon },
];

const ESCALATED_ACTIONS = [
  { key: 'assign', label: 'Assign', Icon: AssignmentIndIcon },
  { key: 'add-note', label: 'Add Note', Icon: NoteAddOutlinedIcon },
  { key: 'record-contact', label: 'Record Contact', Icon: ContactPhoneIcon },
];

const RESOLVED_ACTIONS = [
  { key: 'reopen', label: 'Reopen', Icon: ReplayIcon },
  { key: 'add-note', label: 'Add Note', Icon: NoteAddOutlinedIcon },
];

const FALSE_ALARM_ACTIONS = [
  { key: 'reopen', label: 'Reopen', Icon: ReplayIcon },
];

const DANGER_KEYS = new Set(['resolve', 'mark-false-alarm']);

function resolveActionGroups(status) {
  switch (status) {
    case 'active':
      return [
        { key: 'operations', label: 'Operations', items: ACTIVE_ACTIONS },
        { key: 'danger', label: 'Danger', items: DANGER_ACTIONS },
      ];
    case 'acknowledged':
      return [
        { key: 'operations', label: 'Operations', items: ACKNOWLEDGED_ACTIONS },
        { key: 'danger', label: 'Danger', items: DANGER_ACTIONS },
      ];
    case 'escalated':
      return [
        { key: 'operations', label: 'Operations', items: ESCALATED_ACTIONS },
        { key: 'danger', label: 'Danger', items: DANGER_ACTIONS },
      ];
    case 'resolved':
      return [
        { key: 'operations', label: 'Operations', items: RESOLVED_ACTIONS },
      ];
    case 'false_alarm':
      return [
        { key: 'operations', label: 'Operations', items: FALSE_ALARM_ACTIONS },
      ];
    default:
      return [
        { key: 'operations', label: 'Operations', items: ACTIVE_ACTIONS },
      ];
  }
}

export default function AlertActions({
  alert,
  onAction,
  isActionLoading,
}) {
  if (!alert) return null;

  const groups = resolveActionGroups(alert.status);

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Alert actions">
      {groups.map((group, groupIndex) => {
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
                  const isDanger = DANGER_KEYS.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.actionBtn} ${
                        isDanger ? styles.actionBtnDanger : ''
                      } ${isLoading ? styles.actionBtnLoading : ''}`}
                      onClick={() => onAction(key, alert)}
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
