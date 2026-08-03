import styles from './AdminActivity.module.css';

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className={styles.skeleton}>
      <td><div className={`${styles.skeletonBar} w-28`} /></td>
      <td><div className={`${styles.skeletonBar} w-32`} /></td>
      <td><div className={`${styles.skeletonBar} w-24`} /></td>
      <td><div className={`${styles.skeletonBar} w-16`} /></td>
      <td><div className={`${styles.skeletonBar} w-20`} /></td>
    </tr>
  ));
}

export default function AdminActivity({ activities, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Detail</th>
              <th>Target</th>
              <th>Timestamp</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody><SkeletonRows /></tbody>
        </table>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Detail</th>
              <th>Target</th>
              <th>Timestamp</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className={styles.empty}>No recent activity.</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const entries = activities.slice(0, 20);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Action</th>
            <th>Detail</th>
            <th>Target</th>
            <th>Timestamp</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((act) => (
            <tr key={act.id}>
              <td className={styles.actionCell}>{act.action}</td>
              <td className={styles.detailCell}>{act.detail || '-'}</td>
              <td className={styles.targetCell}>{act.target}</td>
              <td className={styles.timeCell}>{act.timestamp}</td>
              <td className={styles.ipCell}>{act.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
