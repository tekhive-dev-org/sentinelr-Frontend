import styles from "./OverviewStats.module.css";
import AdminStatCard from "./AdminStatCard";

import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";

const METRICS = [
  // ── Available metrics ──────────────────────────────────────────
  {
    title: "Total Users",
    icon: PeopleOutlinedIcon,
    valueKey: "total",
    href: "/dashboard/users",
    errorKey: "total",
  },
  {
    title: "Verified Users",
    icon: VerifiedUserOutlinedIcon,
    valueKey: "verified",
    href: "/dashboard/users",
  },
  {
    title: "Blocked Users",
    icon: BlockOutlinedIcon,
    valueKey: "blocked",
    href: "/dashboard/users",
    errorKey: "blocked",
  },
  {
    title: "Flagged Accounts",
    icon: ReportProblemOutlinedIcon,
    valueKey: "flagged",
    href: "/dashboard/users",
    errorKey: "flagged",
  },
  {
    title: "Active SOS Incidents",
    icon: CampaignOutlinedIcon,
    valueKey: "activeSOS",
    href: "/dashboard/alerts",
    errorKey: "activeAlerts",
  },
  // ── Permanently unavailable metrics ────────────────────────────
  {
    title: "Families",
    icon: FamilyRestroomOutlinedIcon,
    unavailable: true,
  },
  {
    title: "Paired Devices",
    icon: DevicesOutlinedIcon,
    unavailable: true,
  },
  {
    title: "Active Subscriptions",
    icon: CreditCardOutlinedIcon,
    unavailable: true,
  },
];

export default function OverviewStats({ stats, widgetErrors, isLoading }) {
  return (
    <div className={styles.grid}>
      {METRICS.map((metric) => {
        const Icon = metric.icon;

        return (
          <AdminStatCard
            key={metric.title}
            icon={Icon}
            label={metric.title}
            value={metric.unavailable ? undefined : stats?.[metric.valueKey]}
            subtitle={metric.unavailable ? undefined : "Live count"}
            href={metric.href ?? null}
            error={
              metric.errorKey ? widgetErrors?.[metric.errorKey] : undefined
            }
            unavailable={metric.unavailable ?? false}
            isLoading={isLoading}
          />
        );
      })}
    </div>
  );
}
