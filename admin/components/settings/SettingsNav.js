import { useState, useRef, useEffect, useCallback } from "react";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FenceOutlinedIcon from "@mui/icons-material/FenceOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import styles from "./SettingsNav.module.css";

const ICON_MAP = {
  SettingsOutlined: SettingsOutlinedIcon,
  HowToRegOutlined: HowToRegOutlinedIcon,
  DevicesOutlined: DevicesOutlinedIcon,
  CampaignOutlined: CampaignOutlinedIcon,
  FenceOutlined: FenceOutlinedIcon,
  FamilyRestroomOutlined: FamilyRestroomOutlinedIcon,
  CreditCardOutlined: CreditCardOutlinedIcon,
  NotificationsOutlined: NotificationsOutlinedIcon,
  DescriptionOutlined: DescriptionOutlinedIcon,
  BuildOutlined: BuildOutlinedIcon,
  ToggleOnOutlined: ToggleOnOutlinedIcon,
  ArchiveOutlined: ArchiveOutlinedIcon,
  HubOutlined: HubOutlinedIcon,
};

const DANGEROUS_GROUP_KEYS = [
  "maintenance",
  "features",
  "retention",
  "subscriptions",
  "sos",
];

export default function SettingsNav({
  groups = [],
  activeGroup,
  onGroupChange,
  canManageDangerous = false,
}) {
  const scrollRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const visibleGroups = groups.filter(
    (g) => !g.dangerous || canManageDangerous,
  );

  const updateScrollFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollFades();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollFades, { passive: true });
    window.addEventListener("resize", updateScrollFades);
    return () => {
      el.removeEventListener("scroll", updateScrollFades);
      window.removeEventListener("resize", updateScrollFades);
    };
  }, [updateScrollFades, visibleGroups]);

  const isDangerous = (group) => DANGEROUS_GROUP_KEYS.includes(group.key);

  return (
    <nav className={styles.nav} aria-label="Settings categories">
      {showLeftFade ? (
        <div className={styles.fadeLeft} aria-hidden="true" />
      ) : null}
      <ul ref={scrollRef} className={styles.tabList} role="tablist">
        {visibleGroups.map((group) => {
          const Icon = ICON_MAP[group.icon] || SettingsOutlinedIcon;
          const active = activeGroup === group.key;
          const dangerous = isDangerous(group);
          const locked = dangerous && !canManageDangerous;

          return (
            <li key={group.key} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                className={`${styles.tab} ${active ? styles.tabActive : ""} ${
                  dangerous ? styles.tabDangerous : ""
                } ${locked ? styles.tabLocked : ""}`}
                onClick={() => onGroupChange(group.key)}
                disabled={locked}
                title={
                  locked
                    ? "You do not have permission to manage this group"
                    : group.description
                }
              >
                <span className={styles.tabIcon} aria-hidden="true">
                  <Icon fontSize="inherit" />
                </span>
                <span className={styles.tabLabel}>{group.label}</span>
                {locked ? (
                  <span className={styles.lockIcon} aria-hidden="true">
                    <LockOutlinedIcon fontSize="inherit" />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {showRightFade ? (
        <div className={styles.fadeRight} aria-hidden="true" />
      ) : null}
    </nav>
  );
}
