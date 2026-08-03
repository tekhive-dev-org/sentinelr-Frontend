import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import styles from "./IntegrationCard.module.css";
import { formatDate } from "../../utils/settingsAdapters";

const STATUS_MAP = {
  connected: { label: "Connected", className: "statusConnected" },
  disconnected: { label: "Disconnected", className: "statusDisconnected" },
  degraded: { label: "Degraded", className: "statusDegraded" },
  unknown: { label: "Unknown", className: "statusUnknown" },
};

function IntegrationItem({ integration, onTest }) {
  const status = (integration.status || "unknown").toLowerCase();
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.unknown;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardName}>{integration.name}</h3>
          {integration.description ? (
            <p className={styles.cardDescription}>
              {integration.description}
            </p>
          ) : null}
        </div>
        <span
          className={`${styles.statusPill} ${styles[statusInfo.className]}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.lastChecked}>
          {integration.lastChecked
            ? `Last checked ${formatDate(integration.lastChecked)}`
            : "Not yet checked"}
        </span>
        <button
          type="button"
          className={styles.testButton}
          onClick={() => onTest(integration.key)}
        >
          <CableOutlinedIcon className={styles.buttonIcon} />
          Test connection
        </button>
      </div>
    </div>
  );
}

export default function IntegrationCard({
  integrations = null,
  isLoading = false,
  onTest,
}) {
  const list = integrations || [];

  return (
    <section aria-labelledby="integrations-title">
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          <HubOutlinedIcon fontSize="inherit" />
        </span>
        <div>
          <h2 id="integrations-title" className={styles.title}>
            Integrations
          </h2>
          <p className={styles.subtitle}>
            Third-party service connection status — no secrets exposed
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
              <div className={styles.skeletonLineShort} />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>
          <p>No integrations configured.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {list.map((integration) => (
            <IntegrationItem
              key={integration.key}
              integration={integration}
              onTest={onTest}
            />
          ))}
        </div>
      )}

      <div className={styles.note}>
        Connection status only — no secrets are displayed
      </div>
    </section>
  );
}
