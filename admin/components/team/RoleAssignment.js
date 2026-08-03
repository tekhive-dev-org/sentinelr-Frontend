import { useState, useEffect, useCallback } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ROLE_OPTIONS } from '../../utils/teamAdapters';
import styles from './RoleAssignment.module.css';

export default function RoleAssignment({ admin, currentAdminId, onAssign, isActionLoading }) {
  const [selected, setSelected] = useState([]);
  const isSelf = admin?.id === currentAdminId;

  useEffect(() => {
    if (admin?.roles) {
      setSelected([...admin.roles]);
    }
  }, [admin]);

  const toggle = useCallback((roleKey) => {
    if (isSelf) return;
    setSelected((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  }, [isSelf]);

  if (!admin) {
    return (
      <div className={styles.wrapper}>
        <p className="py-8 text-center text-sm text-slate-500">Select an admin to manage roles.</p>
      </div>
    );
  }

  const isSaving = isActionLoading === 'assignRoles';

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Role Assignment</h3>
      <p className={styles.subtitle}>
        {isSelf
          ? 'You cannot modify your own roles.'
          : `Toggle roles for ${admin.name}. Click Save to persist.`}
      </p>

      <div className={styles.chips}>
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.key);
          return (
            <div key={opt.key} className={styles.tooltipWrap}>
              <button
                type="button"
                className={`${styles.chip} ${isSelected ? styles.chipOn : styles.chipOff}`}
                disabled={isSelf}
                onClick={() => toggle(opt.key)}
              >
                {isSelected ? (
                  <RemoveIcon className={styles.removeIcon} fontSize="inherit" />
                ) : (
                  <AddIcon className={styles.addIcon} fontSize="inherit" />
                )}
                {opt.label}
              </button>
              {isSelf && (
                <span className={styles.tooltip}>Cannot modify your own roles</span>
              )}
            </div>
          );
        })}
      </div>

      {isSelf && <p className={styles.selfNotice}>⚠ Self-protection: role changes are disabled for your own account.</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.saveButton}
          disabled={isSelf || isSaving}
          onClick={() => onAssign(admin.id, selected)}
        >
          {isSaving ? 'Saving...' : 'Save Roles'}
        </button>
        {isSelf && <span className={styles.savingText}>You are viewing your own roles.</span>}
      </div>
    </div>
  );
}
