import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import { adminNotificationsService } from "../../../services/adminNotificationsService";
import { CampaignForm, CampaignDelivery } from "../../../components/notifications";
import { ConfirmActionModal } from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./detail.module.css";

export default function CampaignDetailPage() {
  const router = useRouter(); const { id } = router.query; const isNew = id === "new";
  const { adminUser } = useAdminAuth();
  const canSend = adminUser?.permissions?.includes(ADMIN_PERMISSIONS.NOTIFICATIONS_SEND) || false;

  const [campaign, setCampaign] = useState(isNew ? { title: "", channel: "in_app", audience: "all", body: "", status: "draft" } : null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, onConfirm: null });

  const fetchCampaign = useCallback(async () => {
    if (isNew) return;
    setIsLoading(true); setError(null);
    try { const data = await adminNotificationsService.getCampaign(id); setCampaign(data?.campaign || data); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }, [id, isNew]);
  useEffect(() => { fetchCampaign(); }, [fetchCampaign]);
  useEffect(() => { if (!isNew && id) { adminNotificationsService.getDeliveryStatus(id).then(d => setDelivery(d)).catch(() => setDelivery(null)); } }, [id, isNew]);

  const handleSave = async (data) => { setIsSaving(true); try { if (isNew) { const res = await adminNotificationsService.createCampaign(data); router.replace(`/dashboard/notifications/${res.id || res.campaign?.id}`); } else { await adminNotificationsService.updateCampaign(id, data); fetchCampaign(); } } catch (err) { setError(err.message); } finally { setIsSaving(false); } };
  const handleSend = () => {
    setConfirmModal({ isOpen: true, title: "Send campaign", message: `Send "${campaign?.title}" to ${campaign?.audience === "all" ? "all users" : campaign?.audience}? This cannot be undone.`, confirmLabel: "Send now", isDanger: true, onConfirm: async () => { setIsSaving(true); try { await adminNotificationsService.sendCampaign(id); fetchCampaign(); } catch (err) { setError(err.message); } finally { setIsSaving(false); setConfirmModal(p => ({ ...p, isOpen: false })); } } });
  };

  if (isLoading) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW]}><AdminLayout><div className={styles.loadingPage}><div className={styles.loadingSpinner} /></div></AdminLayout></AdminRouteGuard>);
  if (error && !campaign) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW]}><AdminLayout><div className={styles.errorCard}><ErrorOutlineIcon className={styles.errorIcon} /><h2 className={styles.errorTitle}>Failed to load</h2><p className={styles.errorMessage}>{error}</p><button className={styles.retryButton} onClick={fetchCampaign}>Retry</button></div></AdminLayout></AdminRouteGuard>);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button className={styles.backLink} onClick={() => router.push("/dashboard/notifications")}><ArrowBackOutlinedIcon className={styles.backIcon} /> Back to campaigns</button>
          <CampaignForm campaign={campaign} onSave={handleSave} onSend={canSend ? handleSend : null} onSchedule={(data) => {}} onRequestApproval={() => {}} isSaving={isSaving} />
          {!isNew && <CampaignDelivery delivery={delivery} isLoading={false} />}
          <ConfirmActionModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))} isLoading={isSaving} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
