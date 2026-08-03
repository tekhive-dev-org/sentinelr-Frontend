import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import styles from './GeofencingStats.module.css';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Zones',
    icon: PublicOutlinedIcon,
    accent: 'accentSlate',
  },
  {
    key: 'active',
    label: 'Active',
    icon: CheckCircleOutlinedIcon,
    accent: 'accentGreen',
  },
  {
    key: 'inactive',
    label: 'Inactive',
    icon: RemoveCircleOutlinedIcon,
    accent: 'accentGrey',
  },
  {
    key: 'safeZones',
    label: 'Safe Zones',
    icon: ShieldOutlinedIcon,
    accent: 'accentBlue',
  },
  {
    key: 'dangerZones',
    label: 'Danger Zones',
    icon: WarningAmberOutlinedIcon,
    accent: 'accentRed',
  },
  {
    key: 'eventsToday',
    label: 'Events Today',
    icon: EventNoteOutlinedIcon,
    accent: 'accentAmber',
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

export default function GeofencingStats({ stats, isLoading }) {
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
