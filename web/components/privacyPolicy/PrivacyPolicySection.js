import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicySection({ title, body, items, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children || (items ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.paragraph}>{body}</p>
      ))}
    </section>
  );
}
