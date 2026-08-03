import { useEffect, useRef, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './ConfirmActionModal.module.css';

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  isDanger = false,
  requireReason = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const overlayRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const reasonRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus trap: cycle focus between cancel, confirm, and textarea
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = [
        cancelBtnRef.current,
        requireReason ? reasonRef.current : null,
        confirmBtnRef.current,
      ].filter(Boolean);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onCancel, requireReason],
  );

  // Overlay click-outside
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) {
        onCancel();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;

    // Focus the confirm button by default
    confirmBtnRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus to the element that opened the modal
      previousActiveElement.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  const handleConfirm = () => {
    if (isLoading) return;
    const reason = requireReason ? reasonRef.current?.value || '' : '';
    onConfirm({ reason });
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 id="confirm-modal-title" className={styles.title}>
            {title}
          </h2>
        </div>

        <div className={styles.body}>
          <p id="confirm-modal-message" className={styles.message}>
            {message}
          </p>

          {requireReason && (
            <div className={styles.reasonField}>
              <label htmlFor="confirm-modal-reason" className={styles.reasonLabel}>
                Reason for action
              </label>
              <textarea
                id="confirm-modal-reason"
                ref={reasonRef}
                className={styles.reasonTextarea}
                rows={3}
                placeholder="Provide a reason for this action..."
              />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            ref={cancelBtnRef}
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className={`${styles.confirmBtn} ${
              isDanger ? styles.confirmBtnDanger : styles.confirmBtnPrimary
            }`}
            onClick={handleConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <CircularProgress
                  size={16}
                  className={styles.confirmSpinner}
                  aria-hidden="true"
                />
                <span>Processing…</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
