import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import styles from './ParentalStats.module.css';

const STAT_CARDS = [
  {
    key: 'totalFamilies',
    label: 'Total Families',
    icon: GroupsOutlinedIcon,
    accent: 'accentSlate',
  },
  {
    key: 'monitoringActive',
    label: 'Monitoring Active',
    icon: MonitorHeartOutlinedIcon,
    accent: 'accentGreen',
  },
  {
    key: 'screenTime',
    label: 'Screen Time',
    icon: ScreenShareOutlinedIcon,
    accent: 'accentBlue',
  },
  {
    key: 'appBlocking',
    label: 'App Blocking',
    icon: BlockOutlinedIcon,
    accent: 'accentAmber',
  },
  {
    key: 'webFiltering',
    label: 'Web Filtering',
    icon: LanguageOutlinedIcon,
    accent: 'accentPurple',
  },
  {
    key: 'bedtime',
    label: 'Bedtime',
    icon: BedtimeOutlinedIcon,
    accent: 'accentIndigo',
  },
  {
    key: 'frozenDevices',
    label: 'Frozen Devices',
    icon: AcUnitOutlinedIcon,
    accent: 'accentCyan',
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

export default function ParentalStats({ stats, isLoading }) {
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
