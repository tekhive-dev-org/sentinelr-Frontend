import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import NotInterestedOutlinedIcon from '@mui/icons-material/NotInterestedOutlined';
import styles from './AlertStats.module.css';

const STAT_CARDS = [
  {
    key: 'active',
    label: 'Active',
    icon: CampaignOutlinedIcon,
    accent: 'accentRed',
  },
  {
    key: 'acknowledged',
    label: 'Acknowledged',
    icon: CheckCircleOutlinedIcon,
    accent: 'accentBlue',
  },
  {
    key: 'escalated',
    label: 'Escalated',
    icon: ArrowUpwardOutlinedIcon,
    accent: 'accentAmber',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: DoneAllOutlinedIcon,
    accent: 'accentGreen',
  },
  {
    key: 'falseAlarm',
    label: 'False Alarm',
    icon: NotInterestedOutlinedIcon,
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

export default function AlertStats({ stats, isLoading }) {
  return (
    <div className={styles.grid}>
      {isLoading
        ? STAT_CARDS.map((card) => <StatCardSkeleton key={card.key} />)
        : STAT_CARDS.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key] ?? 0;
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
