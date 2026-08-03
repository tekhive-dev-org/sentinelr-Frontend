import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import { adminSettingsService } from "../../../services/adminSettingsService";
import { SETTING_GROUPS, DANGEROUS_GROUPS } from "../../../utils/settingsAdapters";
import { SettingsNav, SettingsGroup, MaintenanceCard, FeatureFlags, IntegrationCard, SettingsHistory } from "../../../components/settings";
import { ConfirmActionModal } from "../../../components/users";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./settings.module.css";

const SPECIAL_GROUPS = ["maintenance", "features", "integrations"];

export default function SettingsPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const canManage = adminUser?.permissions?.includes(ADMIN_PERMISSIONS.SETTINGS_MANAGE) || false;
  const canManageDangerous = canManage && adminUser?.roles?.some(r => r === "super_admin" || r === "admin");

  const groupKey = router.query.group || "general";
  const activeGroup = SETTING_GROUPS.find(g => g.key === groupKey) || SETTING_GROUPS[0];

  const [allSettings, setAllSettings] = useState(null);
  const [integrations, setIntegrations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, requireReason: true, onConfirm: null });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const data = await adminSettingsService.getSettings();
      setAllSettings(data?.settings || data);
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  }, []);
  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => {
    adminSettingsService.getIntegrationStatus().then(setIntegrations).catch(() => setIntegrations(null));
  }, []);

  const handleGroupChange = (key) => {
    router.push({ pathname: router.pathname, query: { group: key } }, undefined, { shallow: true });
  };

  const handleUpdate = async (settings) => {
    const reason = `Updated ${activeGroup.label} settings`;
    setIsSaving(true);
    try { await adminSettingsService.updateGroup(groupKey, settings, reason); fetchSettings(); }
    catch (err) { setError(err.message); } finally { setIsSaving(false); }
  };

  const handleMaintenanceToggle = (enabled) => {
    setConfirmModal({
      isOpen: true, title: enabled ? "Enable maintenance mode" : "Disable maintenance mode",
      message: enabled ? "Users will see a maintenance banner and cannot access the platform. Admins retain access." : "Restore normal platform access for all users?",
      confirmLabel: enabled ? "Enable maintenance" : "Disable maintenance", isDanger: enabled, requireReason: true,
      onConfirm: async ({ reason }) => { setIsSaving(true); try { await adminSettingsService.toggleMaintenanceMode(enabled, reason); fetchSettings(); } catch (err) { setError(err.message); } finally { setIsSaving(false); setConfirmModal(p => ({ ...p, isOpen: false })); } },
    });
  };

  const handleFeatureToggle = (flagKey, enabled) => {
    setConfirmModal({
      isOpen: true, title: `${enabled ? "Enable" : "Disable"} feature flag`, message: `Toggle "${flagKey}"? Backend confirmation required.`, confirmLabel: enabled ? "Enable" : "Disable", requireReason: true,
      onConfirm: async ({ reason }) => { setIsSaving(true); try { await adminSettingsService.updateFeatureFlag(flagKey, enabled, reason); fetchSettings(); } catch (err) { setError(err.message); } finally { setIsSaving(false); setConfirmModal(p => ({ ...p, isOpen: false })); } },
    });
  };

  const handleTestIntegration = async (key) => {
    try { await adminSettingsService.testIntegration(key); fetchSettings(); } catch (err) { setError(err.message); }
  };

  const handleHistory = async (settingKey) => {
    try { const d = await adminSettingsService.getSettingHistory(groupKey, settingKey); setHistory(d?.history || []); } catch { setHistory([]); }
  };

  const isDangerousGroup = DANGEROUS_GROUPS.includes(groupKey);
  const canEdit = isDangerousGroup ? canManageDangerous : canManage;

  if (isLoading) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SETTINGS_VIEW]}><AdminLayout><div className={styles.loadingPage}><div className={styles.loadingSpinner} /></div></AdminLayout></AdminRouteGuard>);
  if (error && !allSettings) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SETTINGS_VIEW]}><AdminLayout><div className={styles.errorCard}><ErrorOutlineIcon className={styles.errorIcon} /><h2 className={styles.errorTitle}>Failed to load settings</h2><p className={styles.errorMessage}>{error}</p><button className={styles.retryButton} onClick={fetchSettings}>Retry</button></div></AdminLayout></AdminRouteGuard>);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SETTINGS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.layout}>
            <div className={styles.nav}>
              <SettingsNav groups={SETTING_GROUPS} activeGroup={groupKey} onGroupChange={handleGroupChange} canManageDangerous={canManageDangerous} />
            </div>
            <div className={styles.content}>
              {groupKey === "maintenance" ? (
                <MaintenanceCard settings={allSettings?.maintenance || null} onToggle={handleMaintenanceToggle} isToggling={isSaving} canManage={canManage} />
              ) : groupKey === "features" ? (
                <FeatureFlags flags={allSettings?.features || null} onToggle={handleFeatureToggle} isToggling={isSaving} canManage={canManage} />
              ) : groupKey === "integrations" ? (
                <IntegrationCard integrations={integrations} isLoading={false} onTest={handleTestIntegration} />
              ) : (
                <SettingsGroup group={activeGroup} settings={allSettings?.[groupKey] || null} onUpdate={handleUpdate} isSaving={isSaving} canManage={canEdit} canManageDangerous={canManageDangerous} />
              )}
              {history && <SettingsHistory history={history} isLoading={false} />}
            </div>
          </div>
        </div>
        <ConfirmActionModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger} requireReason={confirmModal.requireReason} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))} isLoading={isSaving} />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
