import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  getChangePercent,
  getChangeLabel,
  getChangeDirection,
} from "../../utils/analyticsAdapters";
import styles from "./OverviewCards.module.css";

/* ── card definitions ── */

const CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: PeopleOutlinedIcon,
    valueKey: "totalUsers",
  },
  {
    key: "activeUsers",
    label: "Active Users",
    icon: TrendingUpOutlinedIcon,
    valueKey: "activeUsers",
  },
  {
    key: "devices",
    label: "Devices Paired",
    icon: DevicesOutlinedIcon,
    valueKey: "devices",
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    icon: CreditCardOutlinedIcon,
    valueKey: "subscriptions",
  },
];

/* ── helpers ── */

function OverviewCard({ icon: Icon, label, value, comparison, isLoading }) {
  /* loading skeleton */
  if (isLoading) {
    return (
      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <Icon className={styles.icon} />
          </div>
          <span className={styles.label}>{label}</span>
        </div>
        <div className={styles.skeletonValue} />
        <div className={styles.skeletonChange} />
        <div className={styles.skeletonSub} />
      </div>
    );
  }

  /* no data or null value */
  const hasValue = value !== null && value !== undefined;
  if (!hasValue) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <Icon className={styles.icon} />
          </div>
          <span className={styles.label}>{label}</span>
        </div>
        <p className={styles.dashValue}>--</p>
        <p className={styles.noDataSubtitle}>No data available</p>
      </div>
    );
  }

  /* change computation */
  const change = getChangePercent(value, comparison);
  const changeLabel = getChangeLabel(change);
  const direction = getChangeDirection(change);

  let changeIndicator = null;
  if (changeLabel && direction) {
    const cls =
      direction === "up"
        ? styles.changeUp
        : direction === "down"
          ? styles.changeDown
          : styles.changeNeutral;

    const ArrowIcon =
      direction === "up"
        ? ArrowUpwardIcon
        : direction === "down"
          ? ArrowDownwardIcon
          : RemoveIcon;

    changeIndicator = (
      <span className={cls} aria-label={`Change ${changeLabel}`}>
        <ArrowIcon className={styles.changeIcon} fontSize="inherit" />
        {changeLabel}
      </span>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox} aria-hidden="true">
          <Icon className={styles.icon} />
        </div>
        <span className={styles.label}>{label}</span>
      </div>
      <p className={styles.value}>{value.toLocaleString?.() ?? value}</p>
      {changeIndicator ? <div className={styles.changeRow}>{changeIndicator}</div> : null}
      <p className={styles.subtitle}>vs previous period</p>
    </div>
  );
}

/* ── main export ── */

export default function OverviewCards({ overview, isLoading }) {
  return (
    <div className={styles.grid} aria-label="Analytics overview">
      {CARDS.map((card) => (
        <OverviewCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={overview?.[card.valueKey]}
          comparison={overview?.[`${card.valueKey}Comparison`]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
