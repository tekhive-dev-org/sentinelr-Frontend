import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import styles from './SupportStats.module.css';

const STAT_CARDS = [
  {
    key: 'open',
    label: 'Open',
    icon: InboxOutlinedIcon,
    accent: 'accentRed',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: AutorenewOutlinedIcon,
    accent: 'accentBlue',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: DoneAllOutlinedIcon,
    accent: 'accentGreen',
  },
  {
    key: 'escalated',
    label: 'Escalated',
    icon: ArrowUpwardOutlinedIcon,
    accent: 'accentAmber',
  },
  {
    key: 'avgResponseTime',
    label: 'Avg Response Time',
    icon: AccessTimeOutlinedIcon,
    accent: 'accentSlate',
  },
];

function StatCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={`${styles.iconBox} ${styles.accentSlate}`}>
        <div className={styles.valueSkeleton} style={{ width: 20, height: 20 }} />
      </div>
      <div className={styles.valueSkeleton} />
      <div className={styles.labelSkeleton} />
    </div>
  );
}

export default function SupportStats({ stats, isLoading }) {
  return (
    <div className={styles.grid}>
      {isLoading
        ? STAT_CARDS.map((card) => <StatCardSkeleton key={card.key} />)
        : STAT_CARDS.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key] ?? (card.key === 'avgResponseTime' ? '—' : 0);
            const accentClass = styles[card.accent];

            return (
              <div key={card.key} className={`${styles.card} ${accentClass}`}>
                <div className={styles.iconBox}>
                  <Icon className={styles.icon} />
                </div>
                <p className={styles.valueText}>{value}</p>
                <p className={styles.label}>{card.label}</p>
              </div>
            );
          })}
    </div>
  );
}
