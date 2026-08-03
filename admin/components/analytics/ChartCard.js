import { useMemo } from "react";
import { motion } from "framer-motion";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import styles from "./ChartCard.module.css";

/* ── helpers ── */

function hasData(data) {
  return Array.isArray(data) && data.length > 0;
}

function buildScreenReaderTable(data, metricKey) {
  if (!hasData(data)) return null;

  const keys = Object.keys(data[0]);
  const headers = keys.map((k) => `<th scope="col">${k}</th>`).join("");
  const rows = data
    .map(
      (row) =>
        `<tr>${keys.map((k) => `<td>${row[k] ?? ""}</td>`).join("")}</tr>`,
    )
    .join("");

  return {
    __html: `<table><caption>Chart data for ${metricKey}</caption><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`,
  };
}

/* ── sub-components ── */

function ChartSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.shimmerBar} style={{ height: "12px" }} />
      <div className={styles.shimmerBar} style={{ width: "80%", height: "12px" }} />
      <div className={styles.shimmerBar} style={{ width: "90%", height: "12px" }} />
      <div className={styles.shimmerExtraTall} />
      <div className={styles.shimmerBar} style={{ width: "70%", height: "12px" }} />
    </div>
  );
}

function ChartError() {
  return (
    <div className={styles.stateWrap}>
      <p className={styles.errorText}>Failed to load</p>
      <p className={styles.retryText}>Tap to retry</p>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className={styles.stateWrap}>
      <p className={styles.emptyText}>Not enough data for this period</p>
    </div>
  );
}

/* ── main export ── */

export default function ChartCard({
  title,
  description,
  metricKey,
  data,
  error,
  isLoading,
  children,
}) {
  const srTable = useMemo(
    () => buildScreenReaderTable(data, metricKey ?? title),
    [data, metricKey, title],
  );

  let body;

  if (isLoading) {
    body = <ChartSkeleton />;
  } else if (error) {
    body = <ChartError />;
  } else if (!hasData(data)) {
    body = <ChartEmpty />;
  } else {
    body = children;
  }

  return (
    <div className={styles.card} aria-label={title}>
      {/* ── header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>{title}</span>
          {description ? (
            <Tooltip title={description} arrow placement="top">
              <button
                type="button"
                className={styles.tooltipTrigger}
                aria-label={`Info about ${title}`}
                tabIndex={0}
              >
                <InfoOutlinedIcon className={styles.tooltipIcon} />
              </button>
            </Tooltip>
          ) : null}
        </div>

        <div className={styles.headerRight}>
          <Tooltip title="Export CSV" arrow>
            <button type="button" className={styles.exportIconBtn} aria-label="Export CSV">
              <FileDownloadOutlinedIcon className={styles.exportIcon} />
            </button>
          </Tooltip>
          <Tooltip title="Export PDF" arrow>
            <button type="button" className={styles.exportIconBtn} aria-label="Export PDF">
              <PictureAsPdfOutlinedIcon className={styles.exportIcon} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── body ── */}
      <div className={styles.body}>
        {!isLoading && !error && hasData(data) ? (
          <motion.div
            className={styles.chartWrap}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {body}
          </motion.div>
        ) : (
          <div className={styles.chartWrap}>{body}</div>
        )}
      </div>

      {/* ── screen reader data table ── */}
      {srTable ? (
        <div
          className={styles.srOnly}
          aria-hidden="true"
          dangerouslySetInnerHTML={srTable}
        />
      ) : null}
    </div>
  );
}
