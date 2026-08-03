import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import BlockIcon from '@mui/icons-material/Block';
import styles from './DevicesStats.module.css';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Devices',
    icon: DevicesOutlinedIcon,
    accent: 'accentSlate',
  },
  {
    key: 'online',
    label: 'Online',
    icon: WifiIcon,
    accent: 'accentGreen',
  },
  {
    key: 'offline',
    label: 'Offline',
    icon: WifiOffIcon,
    accent: 'accentGrey',
  },
  {
    key: 'unpaired',
    label: 'Unpaired',
    icon: LinkOffIcon,
    accent: 'accentAmber',
  },
  {
    key: 'inactive',
    label: 'Inactive',
    icon: TimerOffIcon,
    accent: 'accentSlate',
  },
  {
    key: 'revoked',
    label: 'Revoked',
    icon: BlockIcon,
    accent: 'accentRed',
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

export default function DevicesStats({ stats, isLoading }) {
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
