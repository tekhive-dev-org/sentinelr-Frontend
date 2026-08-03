import { ADMIN_PERMISSIONS } from "../constants/permissions";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FenceOutlinedIcon from "@mui/icons-material/FenceOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export const ADMIN_ROUTES = Object.freeze([
  {
    group: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Overview",
        path: "/dashboard",
        icon: DashboardOutlinedIcon,
        permission: ADMIN_PERMISSIONS.DASHBOARD_VIEW,
        exact: true,
      },
    ],
  },
  {
    group: "Users & Devices",
    items: [
      {
        id: "users",
        label: "Users & Families",
        path: "/dashboard/users",
        icon: PeopleOutlinedIcon,
        permission: ADMIN_PERMISSIONS.USERS_VIEW,
      },
      {
        id: "devices",
        label: "Devices",
        path: "/dashboard/devices",
        icon: DevicesOutlinedIcon,
        permission: ADMIN_PERMISSIONS.DEVICES_VIEW,
      },
    ],
  },
  {
    group: "Safety & Monitoring",
    items: [
      {
        id: "alerts",
        label: "SOS Alerts & Reports",
        path: "/dashboard/alerts",
        icon: CampaignOutlinedIcon,
        permission: ADMIN_PERMISSIONS.ALERTS_VIEW,
        badgeKey: "activeAlerts",
      },
      {
        id: "geofencing",
        label: "Geofencing Oversight",
        path: "/dashboard/geofencing",
        icon: FenceOutlinedIcon,
        permission: ADMIN_PERMISSIONS.GEOFENCING_VIEW,
      },
      {
        id: "parental",
        label: "Parental Controls",
        path: "/dashboard/parental",
        icon: FamilyRestroomOutlinedIcon,
        permission: ADMIN_PERMISSIONS.PARENTAL_VIEW,
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        id: "subscriptions",
        label: "Subscriptions & Payments",
        path: "/dashboard/subscriptions",
        icon: CreditCardOutlinedIcon,
        permission: ADMIN_PERMISSIONS.SUBSCRIPTIONS_VIEW,
      },
      {
        id: "content",
        label: "Content Management",
        path: "/dashboard/content",
        icon: DescriptionOutlinedIcon,
        permission: ADMIN_PERMISSIONS.CONTENT_VIEW,
      },
      {
        id: "analytics",
        label: "Analytics & Reports",
        path: "/dashboard/analytics",
        icon: BarChartOutlinedIcon,
        permission: ADMIN_PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        id: "notifications",
        label: "Notifications",
        path: "/dashboard/notifications",
        icon: NotificationsOutlinedIcon,
        permission: ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW,
      },
    ],
  },
  {
    group: "Administration",
    items: [
      {
        id: "support",
        label: "Support & Feedback",
        path: "/dashboard/support",
        icon: SupportAgentOutlinedIcon,
        permission: ADMIN_PERMISSIONS.SUPPORT_VIEW,
      },
      {
        id: "team",
        label: "Admin Team & Roles",
        path: "/dashboard/team",
        icon: AdminPanelSettingsOutlinedIcon,
        permission: ADMIN_PERMISSIONS.TEAM_VIEW,
      },
      {
        id: "audit",
        label: "Audit Logs",
        path: "/dashboard/audit",
        icon: HistoryOutlinedIcon,
        permission: ADMIN_PERMISSIONS.AUDIT_VIEW,
      },
      {
        id: "settings",
        label: "Platform Settings",
        path: "/dashboard/settings",
        icon: SettingsOutlinedIcon,
        permission: ADMIN_PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
]);

export function getRouteConfig(pathname) {
  for (const group of ADMIN_ROUTES) {
    for (const item of group.items) {
      if (item.exact) {
        if (pathname === item.path) return { group: group.group, ...item };
      } else {
        if (pathname.startsWith(item.path)) return { group: group.group, ...item };
      }
    }
  }
  return null;
}

export function getBreadcrumbs(pathname) {
  const crumbs = [{ label: "Dashboard", path: "/dashboard" }];
  const config = getRouteConfig(pathname);
  if (config && config.path !== "/dashboard") {
    if (config.group !== "Overview") {
      crumbs.push({ label: config.group, path: null });
    }
    crumbs.push({ label: config.label, path: config.path });
  }
  return crumbs;
}
