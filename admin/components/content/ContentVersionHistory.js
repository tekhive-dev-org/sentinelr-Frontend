import styles from "./ContentVersionHistory.module.css";

function Skeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={styles.skeletonDot} />
          <div className="flex-1 space-y-2">
            <div className={`${styles.skeletonLine} w-32`} />
            <div className={`${styles.skeletonLine} w-24`} />
            <div className={`${styles.skeletonLine} w-full`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContentVersionHistory({ versions = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <p className={styles.heading}>Version history</p>
        <Skeleton />
      </div>
    );
  }

  if (!versions.length) {
    return (
      <div className={styles.wrap}>
        <p className={styles.heading}>Version history</p>
        <p className="mt-2 text-sm text-slate-400">No version history available.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Version history</p>
      <div className={styles.list}>
        {versions.map((v, idx) => (
          <div key={v.version ?? idx} className={styles.item}>
            <span
              className={`${styles.dot} ${idx === 0 ? styles.dotLatest : ""}`}
            />
            <p className={styles.version}>
              Version {v.version ?? "?"}
              {idx === 0 ? " (current)" : ""}
            </p>
            <p className={styles.meta}>
              {v.author ? <span>{v.author}</span> : null}
              {v.date ? <span>{v.date}</span> : null}
            </p>
            {v.summary ? <p className={styles.summary}>{v.summary}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
