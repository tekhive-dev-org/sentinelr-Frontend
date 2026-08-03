import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import styles from './AdminActions.module.css';

export default function AdminActions({ admin, currentAdminId, onAction, isActionLoading }) {
  if (!admin) {
    return (
      <div className={styles.wrapper}>
        <p className="py-8 text-center text-sm text-slate-500">Select an admin to manage actions.</p>
      </div>
    );
  }

  const isSelf = admin.id === currentAdminId;
  const isInvited = admin.status === 'invited';
  const isDeactivated = admin.status === 'deactivated';

  function handle(action) {
    onAction?.(admin.id, action);
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Actions</h3>
      <p className={styles.subtitle}>Manage account state for {admin.name}.</p>

      <div className={styles.actions}>
        {/* Activate */}
        {isDeactivated && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => handle('activate')}
            disabled={!!isActionLoading}
          >
            <CheckCircleOutlineIcon className={styles.buttonIcon} fontSize="inherit" />
            Activate
          </button>
        )}

        {/* Deactivate */}
        {!isDeactivated && (
          <div className={styles.tooltipWrap}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonDanger}`}
              onClick={() => handle('deactivate')}
              disabled={isSelf || !!isActionLoading}
            >
              <RemoveCircleOutlineIcon className={styles.buttonIcon} fontSize="inherit" />
              Deactivate
            </button>
            {isSelf && (
              <span className={styles.tooltip}>Cannot deactivate your own account</span>
            )}
          </div>
        )}

        {/* Revoke Sessions */}
        <div className={styles.tooltipWrap}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonDanger}`}
            onClick={() => handle('revokeSessions')}
            disabled={isSelf || !!isActionLoading}
          >
            <BlockOutlinedIcon className={styles.buttonIcon} fontSize="inherit" />
            Revoke Sessions
          </button>
          {isSelf && (
            <span className={styles.tooltip}>Cannot revoke your own sessions</span>
          )}
        </div>

        {/* Invite-specific */}
        {isInvited && (
          <>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => handle('resendInvite')}
              disabled={!!isActionLoading}
            >
              <MailOutlineIcon className={styles.buttonIcon} fontSize="inherit" />
              Resend Invitation
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonDanger}`}
              onClick={() => handle('cancelInvite')}
              disabled={!!isActionLoading}
            >
              <CancelOutlinedIcon className={styles.buttonIcon} fontSize="inherit" />
              Cancel Invitation
            </button>
          </>
        )}
      </div>

      {isSelf && (
        <p className={styles.selfNotice}>⚠ Self-protection: destructive actions are disabled for your own account.</p>
      )}

      {isActionLoading && (
        <span className={styles.loadingText}>Processing {isActionLoading}...</span>
      )}
    </div>
  );
}
