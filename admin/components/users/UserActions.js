import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DoNotDisturbAltOutlinedIcon from '@mui/icons-material/DoNotDisturbAltOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import styles from './UserActions.module.css';

const ACTION_GROUPS = [
  {
    key: 'operations',
    label: 'Operations',
    items: [
      { key: 'verify', label: 'Verify', Icon: VerifiedUserOutlinedIcon },
      { key: 'reject', label: 'Reject', Icon: GppBadOutlinedIcon },
      { key: 'block', label: 'Block', Icon: BlockOutlinedIcon },
      { key: 'unblock', label: 'Unblock', Icon: BlockOutlinedIcon },
      { key: 'suspend', label: 'Suspend', Icon: PauseCircleOutlinedIcon },
      { key: 'restore', label: 'Restore', Icon: RestoreOutlinedIcon },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    items: [
      { key: 'force-logout', label: 'Force Logout', Icon: LogoutOutlinedIcon },
      { key: 'reset-password', label: 'Reset Password', Icon: LockResetOutlinedIcon },
    ],
  },
  {
    key: 'management',
    label: 'Management',
    items: [
      {
        key: 'change-account-type',
        label: 'Change Account Type',
        Icon: ManageAccountsOutlinedIcon,
      },
      { key: 'add-note', label: 'Add Note', Icon: NoteAddOutlinedIcon },
      { key: 'export-data', label: 'Export Data', Icon: FileDownloadOutlinedIcon },
    ],
  },
  {
    key: 'danger',
    label: 'Danger',
    items: [
      {
        key: 'remove-from-family',
        label: 'Remove from Family',
        Icon: PersonRemoveOutlinedIcon,
      },
      {
        key: 'initiate-deletion',
        label: 'Initiate Deletion',
        Icon: DeleteOutlineOutlinedIcon,
      },
    ],
  },
];

const SELF_ACTION_KEYS = new Set([
  'verify',
  'reject',
  'block',
  'unblock',
  'suspend',
  'restore',
  'force-logout',
  'reset-password',
  'change-account-type',
  'initiate-deletion',
]);

function isActionSelfProtected(actionKey) {
  return SELF_ACTION_KEYS.has(actionKey);
}

/**
 * Determines which action items to show based on user status.
 * Suspended or blocked users show Restore instead of Block + Suspend.
 */
function resolveVisibleItems(items, user) {
  const isSuspendedOrBlocked =
    user?.status === 'suspended' || user?.status === 'blocked';

  if (!isSuspendedOrBlocked) {
    return items.filter((item) => item.key !== 'restore');
  }

  return items.filter(
    (item) =>
      item.key === 'restore' ||
      (item.key !== 'block' && item.key !== 'suspend')
  );
}

export default function UserActions({
  user,
  currentAdminId,
  onAction,
  isActionLoading,
}) {
  if (!user) return null;

  const isSelf = user.id === currentAdminId;
  const selfTooltip = 'Cannot modify your own account';

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="User actions">
      {ACTION_GROUPS.map((group, groupIndex) => {
        const visibleItems = resolveVisibleItems(group.items, user);
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.key} className={styles.groupWrapper}>
            {groupIndex > 0 && (
              <div className={styles.divider} aria-hidden="true" />
            )}
            <div className={styles.group}>
              <span className={styles.groupLabel}>{group.label}</span>
              <div className={styles.buttons}>
                {visibleItems.map(({ key, label, Icon }) => {
                  const isLoading = isActionLoading === key;
                  const selfProtected = isSelf && isActionSelfProtected(key);
                  const button = (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.actionBtn} ${
                        group.key === 'danger' ? styles.actionBtnDanger : ''
                      } ${isLoading ? styles.actionBtnLoading : ''}`}
                      onClick={() => onAction(key, user)}
                      disabled={isLoading || selfProtected}
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

                  if (selfProtected) {
                    return (
                      <Tooltip key={key} title={selfTooltip} arrow>
                        <span className={styles.btnWrapper}>{button}</span>
                      </Tooltip>
                    );
                  }

                  return button;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
