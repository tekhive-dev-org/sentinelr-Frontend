import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import styles from './SubscriptionStats.module.css';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Subscriptions',
    icon: ReceiptOutlinedIcon,
    accent: 'accentSlate',
  },
  {
    key: 'active',
    label: 'Active',
    icon: CheckCircleOutlinedIcon,
    accent: 'accentGreen',
  },
  {
    key: 'trials',
    label: 'Trials',
    icon: RocketLaunchOutlinedIcon,
    accent: 'accentBlue',
  },
  {
    key: 'upcomingRenewals',
    label: 'Upcoming Renewals',
    icon: EventOutlinedIcon,
    accent: 'accentAmber',
  },
  {
    key: 'pastDue',
    label: 'Past Due',
    icon: WarningAmberOutlinedIcon,
    accent: 'accentRed',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: CancelOutlinedIcon,
    accent: 'accentSlate',
  },
  {
    key: 'expired',
    label: 'Expired',
    icon: TimerOffOutlinedIcon,
    accent: 'accentGrey',
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

export default function SubscriptionStats({ stats, isLoading }) {
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
