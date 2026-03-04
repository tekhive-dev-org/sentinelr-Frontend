/**
 * HistoryReportsList
 * Displays the reports card with a visual arc preview and a list of report entries.
 */

import React from 'react';
import styles from './HistoryReports.module.css';

const BADGE_MAP = {
  transit:  { className: styles.badgeTransit, label: 'On Transit' },
  work:     { className: styles.badgeWork,    label: 'Work'       },
  home:     { className: styles.badgeHome,    label: 'Home'       },
};

const DOT_MAP = {
  transit:  styles.dotOrange,
  work:     styles.dotGreen,
  home:     styles.dotRed,
};

/**
 * Expected report shape:
 * {
 *   id: string | number,
 *   date: string,         // "July 15, 2019"
 *   user: string,         // "(Casual)"
 *   category: 'transit' | 'work' | 'home',
 * }
 */

function ArcPreview() {
  return (
    <svg
      className={styles.previewArc}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="arcGrad" x1="20" y1="120" x2="180" y2="20">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path
        d="M20 120 Q60 20, 100 80 T180 30"
        stroke="url(#arcGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Decorative dots */}
      <circle cx="20" cy="120" r="4" fill="#3b82f6" opacity="0.3" />
      <circle cx="100" cy="80" r="4" fill="#3b82f6" opacity="0.5" />
      <circle cx="180" cy="30" r="5" fill="#3b82f6" opacity="0.9" />
    </svg>
  );
}

export default function HistoryReportsList({ reports = [], onSeeAll }) {
  return (
    <div className={styles.reportsCard}>
      <div className={styles.reportsHeader}>
        <h3 className={styles.sectionTitle}>
          <span style={{ marginRight: 6 }}>📊</span>
          Reports
        </h3>
        <button className={styles.seeAllBtn} onClick={onSeeAll}>
          See All
        </button>
      </div>

      {/* Visual arc preview */}
      <div className={styles.reportPreview}>
        <ArcPreview />
      </div>

      {/* Report rows */}
      <div className={styles.reportsList}>
        {reports.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '12px 0' }}>
            No reports available
          </p>
        ) : (
          reports.map((r) => {
            const badge = BADGE_MAP[r.category] || BADGE_MAP.transit;
            const dotCls = DOT_MAP[r.category] || DOT_MAP.transit;

            return (
              <div key={r.id} className={styles.reportRow}>
                <div className={styles.reportMeta}>
                  <span className={`${styles.reportDot} ${dotCls}`} />
                  <span className={styles.reportDate}>
                    {r.date}
                    {r.user && <span className={styles.reportCategory}> {r.user}</span>}
                  </span>
                </div>
                <span className={`${styles.reportBadge} ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
