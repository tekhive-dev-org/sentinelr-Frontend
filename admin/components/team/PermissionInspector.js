import styles from './PermissionInspector.module.css';

const CATEGORIES = [
  { prefix: 'admin.', label: 'Admin' },
  { prefix: 'users.', label: 'Users' },
  { prefix: 'alerts.', label: 'Alerts' },
  { prefix: 'content.', label: 'Content' },
  { prefix: 'subscriptions.', label: 'Subscriptions' },
  { prefix: 'analytics.', label: 'Analytics' },
  { prefix: 'settings.', label: 'Settings' },
  { prefix: 'devices.', label: 'Devices' },
  { prefix: 'notifications.', label: 'Notifications' },
  { prefix: 'support.', label: 'Support' },
  { prefix: 'team.', label: 'Team' },
  { prefix: 'audit.', label: 'Audit' },
];

function groupPermissions(permissions) {
  const groups = {};
  const other = [];

  for (const perm of permissions) {
    let matched = false;
    for (const cat of CATEGORIES) {
      if (perm.startsWith(cat.prefix)) {
        if (!groups[cat.label]) groups[cat.label] = [];
        groups[cat.label].push(perm);
        matched = true;
        break;
      }
    }
    if (!matched) other.push(perm);
  }

  const result = CATEGORIES
    .filter((c) => groups[c.label])
    .map((c) => ({ label: c.label, items: groups[c.label] }));

  if (other.length) result.push({ label: 'Other', items: other });

  return result;
}

export default function PermissionInspector({ permissions, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.skeleton}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonGroup}>
              <div className={`${styles.skeletonLine} w-20`} />
              <div className="flex flex-wrap gap-1.5">
                <div className={styles.skeletonBadge} />
                <div className={styles.skeletonBadge} />
                <div className={styles.skeletonBadge} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.title}>Permissions</h3>
        <p className={styles.empty}>No permissions loaded.</p>
      </div>
    );
  }

  const groups = groupPermissions(permissions);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Permissions</h3>
      <p className={styles.subtitle}>{permissions.length} permission{permissions.length !== 1 ? 's' : ''} assigned</p>

      {groups.map((group) => (
        <div key={group.label} className={styles.group}>
          <div className={styles.groupLabel}>{group.label}</div>
          <div className={styles.badges}>
            {group.items.map((perm) => (
              <code key={perm} className={styles.badge}>{perm}</code>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
