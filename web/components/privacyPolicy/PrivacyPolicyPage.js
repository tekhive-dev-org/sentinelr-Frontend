import Head from "next/head";
import Link from "next/link";
import PrivacyPolicySection from "./PrivacyPolicySection";
import {
  LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from "./privacyPolicyContent";
import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Sentinelr</title>
        <meta
          name="description"
          content="How Sentinelr collects, uses, shares, and protects personal data across web and mobile experiences."
        />
      </Head>

      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.kicker}>Legal</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>

          <p className={styles.paragraph}>
            This Privacy Policy explains how Sentinelr collects, uses, stores,
            and protects information when you use our web dashboard and mobile
            application. By using Sentinelr, you agree to the practices
            described here.
          </p>

          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <PrivacyPolicySection
              key={section.title}
              title={section.title}
              body={section.body}
              items={section.items}
            />
          ))}

          <PrivacyPolicySection title="9. Contact Us">
            <p className={styles.paragraph}>
              For privacy questions, contact us at{" "}
              <a href="mailto:privacy@sentinelr.app" className={styles.link}>
                privacy@sentinelr.app
              </a>
              .
            </p>
          </PrivacyPolicySection>

          <div className={styles.actions}>
            <Link href="/login" className={styles.backLink}>
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
