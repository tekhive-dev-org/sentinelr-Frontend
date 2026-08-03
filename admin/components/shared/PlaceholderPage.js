import styles from "./PlaceholderPage.module.css";

export default function PlaceholderPage({ icon: Icon, title, description, phase }) {
  return (
    <div className={styles.page}>
      {Icon ? (
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon className={styles.icon} />
        </span>
      ) : null}
      <p className={styles.eyebrow}>Admin Control Centre</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {phase ? (
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          {phase}
        </span>
      ) : null}
    </div>
  );
}
