import PeopleIcon from "@mui/icons-material/People";
import styles from "./ContentPreview.module.css";

export default function ContentPreview({ item, isLoading = false }) {
  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeleton}>
          <div className={`${styles.skeletonLine} w-3/4`} />
          <div className={`${styles.skeletonLine} w-1/3`} />
          <div className={`${styles.skeletonLine} w-full`} />
          <div className={`${styles.skeletonLine} w-full`} />
          <div className={`${styles.skeletonLine} w-2/3`} />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.card}>
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          No content selected for preview.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{item.title}</h2>
        <div className={styles.badges}>
          <span className={styles.typeBadge}>{item.typeLabel}</span>
          <span className={styles.audienceBadge}>
            <PeopleIcon className={styles.audienceIcon} />
            {item.audienceLabel}
          </span>
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.bodyText}>{item.raw?.body || item.body || "No body content."}</p>
      </div>
    </div>
  );
}
