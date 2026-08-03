import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import { adminContentService } from "../../../services/adminContentService";
import { ContentForm, ContentPreview, ContentVersionHistory } from "../../../components/content";
import { ConfirmActionModal } from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./detail.module.css";

export default function ContentDetailPage() {
  const router = useRouter(); const { id } = router.query; const isNew = id === "new";
  const { adminUser } = useAdminAuth();
  const canPublish = adminUser?.permissions?.includes(ADMIN_PERMISSIONS.CONTENT_PUBLISH) || false;
  const canEdit = adminUser?.permissions?.includes(ADMIN_PERMISSIONS.CONTENT_MANAGE) || false;

  const [item, setItem] = useState(isNew ? { title: "", type: "help", audience: "all", body: "", status: "draft" } : null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, onConfirm: null });

  const fetchItem = useCallback(async () => {
    if (isNew) return;
    setIsLoading(true); setError(null);
    try { const data = await adminContentService.getItem(id); setItem(data?.item || data); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }, [id, isNew]);
  useEffect(() => { fetchItem(); }, [fetchItem]);
  useEffect(() => { if (!isNew && id) { adminContentService.getVersionHistory(id).then(d => setVersions(d?.versions || [])).catch(() => setVersions([])); } }, [id, isNew]);

  const handleSave = async (data) => { setIsSaving(true); try { if (isNew) { const res = await adminContentService.createItem(data); router.replace(`/dashboard/content/${res.id || res.item?.id}`); } else { await adminContentService.updateItem(id, data); fetchItem(); } } catch (err) { setError(err.message); } finally { setIsSaving(false); } };
  const handlePublish = () => {
    setConfirmModal({ isOpen: true, title: "Publish content", message: `Publish "${item?.title}"? It will be visible to ${item?.audience === "all" ? "all users" : item?.audience} immediately.`, confirmLabel: "Publish", onConfirm: async () => { setIsSaving(true); try { await adminContentService.publishItem(id); fetchItem(); } catch (err) { setError(err.message); } finally { setIsSaving(false); setConfirmModal(p => ({ ...p, isOpen: false })); } } });
  };
  const handleArchive = () => {
    setConfirmModal({ isOpen: true, title: "Archive content", message: `Archive "${item?.title}"? It will no longer be publicly visible.`, confirmLabel: "Archive", isDanger: true, onConfirm: async () => { setIsSaving(true); try { await adminContentService.archiveItem(id, "Admin request"); fetchItem(); } catch (err) { setError(err.message); } finally { setIsSaving(false); setConfirmModal(p => ({ ...p, isOpen: false })); } } });
  };

  if (isLoading) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.CONTENT_VIEW]}><AdminLayout><div className={styles.loadingPage}><div className={styles.loadingSpinner} /></div></AdminLayout></AdminRouteGuard>);
  if (error && !item) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.CONTENT_VIEW]}><AdminLayout><div className={styles.errorCard}><ErrorOutlineIcon className={styles.errorIcon} /><h2 className={styles.errorTitle}>Failed to load</h2><p className={styles.errorMessage}>{error}</p><button className={styles.retryButton} onClick={fetchItem}>Retry</button></div></AdminLayout></AdminRouteGuard>);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.CONTENT_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button className={styles.backLink} onClick={() => router.push("/dashboard/content")}><ArrowBackOutlinedIcon className={styles.backIcon} /> Back to content</button>
          {canEdit ? (
            <ContentForm item={item} onSave={handleSave} onPublish={canPublish ? handlePublish : null} onArchive={canPublish ? handleArchive : null} isSaving={isSaving} />
          ) : (
            <ContentPreview item={item} isLoading={false} />
          )}
          {!isNew && <ContentVersionHistory versions={versions} isLoading={false} />}
          <ConfirmActionModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))} isLoading={isSaving} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
