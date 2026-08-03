import Link from "next/link";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CreditCardOffOutlinedIcon from "@mui/icons-material/CreditCardOffOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import styles from "./QuickActions.module.css";

const ACTIONS = [
  {
    label: "Review SOS Incidents",
    href: "/dashboard/alerts",
    icon: CampaignOutlinedIcon,
  },
  {
    label: "Find a User",
    href: "/dashboard/users",
    icon: SearchOutlinedIcon,
  },
  {
    label: "Flagged Accounts",
    href: "/dashboard/users",
    icon: ReportProblemOutlinedIcon,
  },
  {
    label: "Overdue Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCardOffOutlinedIcon,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: HistoryOutlinedIcon,
  },
];

export default function QuickActions() {
  return (
    <div className={styles.actions}>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className={styles.action}
          >
            <span className={styles.iconWrap} aria-hidden="true">
              <Icon fontSize="small" />
            </span>
            <span className={styles.label}>{action.label}</span>
            <ArrowForwardOutlinedIcon
              className={styles.arrow}
              fontSize="small"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </div>
  );
}
