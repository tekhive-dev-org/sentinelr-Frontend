import Head from "next/head";
import Link from "next/link";
import SupportSection from "./SupportSection";
import { SUPPORT_SECTIONS } from "./supportContent";
import styles from "./SupportPage.module.css";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>Support | Sentinelr</title>
        <meta
          name="description"
          content="Get help with Sentinelr — FAQs, troubleshooting, and how to contact our support team."
        />
      </Head>

      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.kicker}>Help Center</p>
          <h1 className={styles.title}>How can we help?</h1>
          <p className={styles.subtitle}>
            Find answers to common questions or reach out to our support team.
          </p>

          {/* Quick contact cards */}
          <div className={styles.contactRow}>
            <a href="mailto:support@sentinelr.app" className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <EmailOutlinedIcon />
              </div>
              <span className={styles.contactLabel}>Email Support</span>
              <span className={styles.contactValue}>support@sentinelr.app</span>
            </a>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <HelpOutlineOutlinedIcon />
              </div>
              <span className={styles.contactLabel}>Knowledge Base</span>
              <span className={styles.contactValue}>Browse articles below</span>
            </div>
          </div>

          {/* FAQ / Support sections */}
          {SUPPORT_SECTIONS.map((section, idx) => (
            <SupportSection
              key={idx}
              title={section.title}
              items={section.items}
            />
          ))}

          {/* Still need help */}
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Still need help?</h2>
            <p className={styles.ctaText}>
              Our support team is ready to assist you. We typically respond
              within 24 hours on business days.
            </p>
            <a href="mailto:support@sentinelr.app" className={styles.ctaButton}>
              <EmailOutlinedIcon fontSize="small" />
              Contact Support
            </a>
          </div>

          <div className={styles.actions}>
            <Link href="/login" className={styles.backLink}>
              Back to Login
            </Link>
            <Link href="/dashboard" className={styles.backLink}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
