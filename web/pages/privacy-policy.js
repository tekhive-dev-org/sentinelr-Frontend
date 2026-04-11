import Head from "next/head";
import Link from "next/link";

const LAST_UPDATED = "April 11, 2026";

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

      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.kicker}>Legal</p>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.meta}>Last updated: {LAST_UPDATED}</p>

          <p style={styles.paragraph}>
            This Privacy Policy explains how Sentinelr collects, uses, stores, and
            protects information when you use our web dashboard and mobile
            application. By using Sentinelr, you agree to the practices described
            here.
          </p>

          <Section title="1. Information We Collect">
            <ul style={styles.list}>
              <li>
                Account information: name, email address, and profile details you
                provide during registration.
              </li>
              <li>
                Device information: device identifiers, platform details, and app
                diagnostics needed for security and reliability.
              </li>
              <li>
                Location and activity data: location pings, geofence events, and
                related history when tracking features are enabled.
              </li>
              <li>
                Usage information: interactions with dashboard and app features,
                error logs, and service performance signals.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <ul style={styles.list}>
              <li>Provide core monitoring, alerts, and family safety features.</li>
              <li>Maintain account security and prevent abuse or fraud.</li>
              <li>Improve product quality, app stability, and customer support.</li>
              <li>Comply with legal obligations and enforce platform policies.</li>
            </ul>
          </Section>

          <Section title="3. How We Share Information">
            <p style={styles.paragraph}>
              We do not sell personal information. We may share data with service
              providers that support hosting, analytics, notifications, and
              infrastructure operations under contractual privacy safeguards. We
              may also disclose data when required by law or to protect users,
              Sentinelr, or the public.
            </p>
          </Section>

          <Section title="4. Data Retention">
            <p style={styles.paragraph}>
              We keep information only as long as necessary for the purposes in
              this policy, including legal, security, and operational needs.
              Retention periods may vary by data type and account status.
            </p>
          </Section>

          <Section title="5. Your Choices and Rights">
            <ul style={styles.list}>
              <li>Review and update account profile information.</li>
              <li>Unpair or remove devices from the dashboard.</li>
              <li>Request help with data access, correction, or deletion.</li>
              <li>Control permissions such as location in your device settings.</li>
            </ul>
          </Section>

          <Section title="6. Security">
            <p style={styles.paragraph}>
              We use technical and organizational safeguards designed to protect
              personal data. No system is perfectly secure, but we continuously
              improve our controls and monitoring practices.
            </p>
          </Section>

          <Section title="7. Children and Family Data">
            <p style={styles.paragraph}>
              Sentinelr is designed for family safety use cases. Parents or
              guardians are responsible for lawful use in their jurisdiction,
              including consent and disclosure requirements.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p style={styles.paragraph}>
              We may update this Privacy Policy from time to time. Material
              changes will be reflected by updating the date above and, where
              appropriate, additional notice in product surfaces.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p style={styles.paragraph}>
              For privacy questions, contact us at{" "}
              <a href="mailto:privacy@sentinelr.app" style={styles.link}>
                privacy@sentinelr.app
              </a>
              .
            </p>
          </Section>

          <div style={styles.actions}>
            <Link href="/login" style={styles.backLink}>
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, #f2f8ff 0%, #f7f9fc 45%, #eef2f8 100%)",
    padding: "48px 16px",
    color: "#1f2937",
  },
  card: {
    maxWidth: "920px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #dbe3ef",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
    padding: "32px",
  },
  kicker: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    color: "#1d4ed8",
    fontSize: "12px",
  },
  title: {
    margin: "8px 0 6px",
    fontSize: "36px",
    lineHeight: 1.15,
    color: "#0f172a",
  },
  meta: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: "20px",
    color: "#0f172a",
  },
  paragraph: {
    margin: 0,
    lineHeight: 1.7,
    color: "#334155",
    fontSize: "15px",
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
    color: "#334155",
    lineHeight: 1.7,
    fontSize: "15px",
  },
  link: {
    color: "#1d4ed8",
    textDecoration: "underline",
  },
  actions: {
    marginTop: "28px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "18px",
  },
  backLink: {
    color: "#1d4ed8",
    fontWeight: 600,
  },
};
