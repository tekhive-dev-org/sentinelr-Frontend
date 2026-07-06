import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styles from "./SupportPage.module.css";

export default function SupportSection({ title, items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.faqList}>
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
            >
              <button
                className={styles.faqTrigger}
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <span className={styles.faqQuestion}>{item.q}</span>
                <ExpandMoreIcon
                  className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ""}`}
                />
              </button>
              <div
                className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ""}`}
              >
                <div className={styles.faqAnswerInner}>
                  <p className={styles.paragraph}>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
