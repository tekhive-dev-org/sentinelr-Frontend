import { useState, useRef, useEffect } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { getInitials } from '../../utils/teamAdapters';
import styles from './TeamTable.module.css';

const statusClass = {
  active: styles.pillActive,
  invited: styles.pillInvited,
  suspended: styles.pillSuspended,
  deactivated: styles.pillDeactivated,
};

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className={styles.skeleton}>
      <td>
        <div className={styles.adminCell}>
          <div className={styles.skeletonCircle} />
          <div className={`${styles.skeletonBar} w-24`} />
        </div>
      </td>
      <td><div className={`${styles.skeletonBar} w-40`} /></td>
      <td><div className={`${styles.skeletonBar} w-28`} /></td>
      <td><div className={`${styles.skeletonBar} w-20`} /></td>
      <td><div className={`${styles.skeletonBar} w-8`} /></td>
      <td><div className={`${styles.skeletonBar} w-24`} /></td>
      <td><div className={`${styles.skeletonBar} w-8`} /></td>
    </tr>
  ));
}

export default function TeamTable({ admins = [], isLoading, error, onAdminClick }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function renderBody() {
    if (isLoading) return <SkeletonRows />;
    if (error) return <tr><td colSpan={7} className={styles.error}>{error}</td></tr>;
    if (!admins.length) return <tr><td colSpan={7} className={styles.empty}>No admins found.</td></tr>;

    return admins.map((admin) => (
      <tr key={admin.id}>
        <td>
          <div className={styles.adminCell}>
            <div className={styles.avatar}>{getInitials(admin.name)}</div>
            <span className={styles.adminName}>{admin.name}</span>
          </div>
        </td>
        <td>{admin.email}</td>
        <td>
          {admin.roles?.map((role) => (
            <span key={role} className={styles.rolePill}>{role}</span>
          ))}
        </td>
        <td>
          <span className={`${styles.pill} ${statusClass[admin.status] || styles.pillDeactivated}`}>
            {admin.statusLabel}
          </span>
        </td>
        <td>
          {admin.mfaEnabled ? (
            <CheckCircleIcon className={styles.mfaCheck} fontSize="small" />
          ) : (
            <DoNotDisturbAltIcon className={styles.mfaNone} fontSize="small" />
          )}
        </td>
        <td>{admin.lastActive}</td>
        <td>
          <div className={styles.menuWrap} ref={openMenuId === admin.id ? menuRef : null}>
            <button
              className={styles.actionsBtn}
              onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)}
            >
              <MoreVertIcon className={styles.actionsIcon} />
            </button>
            {openMenuId === admin.id && (
              <div className={styles.menu}>
                <button className={styles.menuItem} onClick={() => { setOpenMenuId(null); onAdminClick?.(admin, 'view'); }}>
                  <VisibilityOutlinedIcon className={styles.menuIcon} /> View
                </button>
                <button className={styles.menuItem} onClick={() => { setOpenMenuId(null); onAdminClick?.(admin, 'edit'); }}>
                  <EditOutlinedIcon className={styles.menuIcon} /> Edit Roles
                </button>
                <button className={styles.menuItem} onClick={() => { setOpenMenuId(null); onAdminClick?.(admin, 'toggle'); }}>
                  {admin.status === 'deactivated' ? (
                    <><ToggleOnOutlinedIcon className={styles.menuIcon} /> Activate</>
                  ) : (
                    <><ToggleOffOutlinedIcon className={styles.menuIcon} /> Deactivate</>
                  )}
                </button>
                <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => { setOpenMenuId(null); onAdminClick?.(admin, 'revoke'); }}>
                  <BlockOutlinedIcon className={styles.menuIcon} /> Revoke Sessions
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    ));
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Admin</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>MFA</th>
            <th>Last Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}
