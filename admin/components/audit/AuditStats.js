import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import styles from './AuditStats.module.css';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Events',
    icon: AssessmentOutlinedIcon,
    accent: 'accentPurple',
  },
  {
    key: 'today',
    label: 'Today',
    icon: TodayOutlinedIcon,
    accent: 'accentGreen',
  },
  {
    key: 'thisWeek',
    label: 'This Week',
    icon: DateRangeOutlinedIcon,
    accent: 'accentBlue',
  },
  {
    key: 'uniqueActors',
    label: 'Unique Actors',
    icon: PeopleOutlinedIcon,
    accent: 'accentAmber',
  },
];

function StatCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={`${styles.iconBox} ${styles.accentPurple}`}>
        <div className={styles.valueSkeleton} style={{ width: 20, height: 20 }} />
      </div>
      <div className={styles.valueSkeleton} />
      <div className={styles.labelSkeleton} />
    </div>
  );
}

export default function AuditStats({ stats, isLoading }) {
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
