import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SendIcon from '@mui/icons-material/Send';
import { ROLE_OPTIONS } from '../../utils/teamAdapters';
import styles from './InviteForm.module.css';

export default function InviteForm({ onInvite, isSending, onCancel }) {
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function toggleRole(key) {
    setSelectedRoles((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || isSending) return;
    onInvite?.({ email: email.trim(), roles: selectedRoles, message: message.trim() });
    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.form}>
        <p className={styles.success}>
          ✅ Invitation sent to <strong>{email}</strong>. They will receive an email with setup instructions.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Invite Admin</h3>
      <p className={styles.subtitle}>Send an invitation to add a new team member.</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="invite-email">Email Address</label>
        <input
          id="invite-email"
          type="email"
          className={styles.input}
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Roles</label>
        <div className={styles.chips}>
          {ROLE_OPTIONS.map((opt) => {
            const isSelected = selectedRoles.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                className={`${styles.chip} ${isSelected ? styles.chipOn : styles.chipOff}`}
                onClick={() => toggleRole(opt.key)}
              >
                {isSelected ? (
                  <RemoveIcon className={styles.removeIcon} fontSize="inherit" />
                ) : (
                  <AddIcon className={styles.addIcon} fontSize="inherit" />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="invite-message">Custom Message (optional)</label>
        <textarea
          id="invite-message"
          className={styles.textarea}
          rows={3}
          placeholder="Add a personal note to the invitation..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={isSending || !email.trim()}>
          <SendIcon fontSize="inherit" />
          {isSending ? 'Sending...' : 'Send Invitation'}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onCancel} disabled={isSending}>
          Cancel
        </button>
      </div>
    </form>
  );
}
