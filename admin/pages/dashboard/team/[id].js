import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import { adminTeamService } from "../../../services/adminTeamService";
import { normalizeAdmin, normalizeActivity } from "../../../utils/teamAdapters";
import { AdminDetailCard, RoleAssignment, PermissionInspector, AdminActivity, AdminActions, InviteForm } from "../../../components/team";
import { ConfirmActionModal } from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./team.module.css";

export default function AdminDetailPage() {
  const router = useRouter(); const { id } = router.query; const isNew = id === "new";
  const { adminUser } = useAdminAuth(); const currentAdminId = adminUser?.id || null;

  const [admin, setAdmin] = useState(null); const [isLoading, setIsLoading] = useState(!isNew);
  const [error, setError] = useState(null); const [actionLoading, setActionLoading] = useState(null);
  const [permissions, setPermissions] = useState(null); const [activities, setActivities] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, requireReason: false, onConfirm: null });

  const fetchAdmin = useCallback(async () => {
    if (isNew) return; setIsLoading(true); setError(null);
    try { const d = await adminTeamService.getAdmin(id); setAdmin(normalizeAdmin(d?.admin || d)); }
    catch (err) { setError(err.message); } finally { setIsLoading(false); }
  }, [id, isNew]);
  useEffect(() => { fetchAdmin(); }, [fetchAdmin]);
  useEffect(() => { if (!isNew && id) { adminTeamService.getPermissions(id).then(d => setPermissions(d?.permissions || [])).catch(() => setPermissions(null)); adminTeamService.getActivity(id, { limit: 20 }).then(d => setActivities((d?.activities || []).map(normalizeActivity).filter(Boolean))).catch(() => setActivities(null)); } }, [id, isNew]);

  const perform = async (name, fn) => { setActionLoading(name); try { await fn(); fetchAdmin(); } catch (err) { setError(err.message); } finally { setActionLoading(null); } };
  const open = (cfg) => setConfirmModal({ isOpen: true, ...cfg });
  const close = () => setConfirmModal(p => ({ ...p, isOpen: false }));

  const handleInvite = async (data) => { setActionLoading("invite"); try { await adminTeamService.inviteAdmin(data); router.push("/dashboard/team"); } catch (err) { setError(err.message); } finally { setActionLoading(null); } };
  const handleAction = (name) => {
    if (name === "activate") perform("activate", () => adminTeamService.activateAdmin(id));
    else if (name === "deactivate") open({ title: "Deactivate admin", message: `Deactivate ${admin?.name || "this admin"}?`, confirmLabel: "Deactivate", isDanger: true, requireReason: true, onConfirm: ({ reason }) => perform("deactivate", () => adminTeamService.deactivateAdmin(id, reason)) });
    else if (name === "revokeSessions") open({ title: "Revoke all sessions", message: `End all active sessions for ${admin?.name || "this admin"}?`, confirmLabel: "Revoke sessions", isDanger: true, onConfirm: () => perform("revokeSessions", () => adminTeamService.revokeSessions(id)) });
    else if (name === "resendInvite") perform("resendInvite", () => adminTeamService.resendInvitation(id));
    else if (name === "cancelInvite") open({ title: "Cancel invitation", message: `Cancel the invitation for ${admin?.email || "this admin"}?`, confirmLabel: "Cancel invitation", isDanger: true, onConfirm: () => perform("cancelInvite", () => adminTeamService.cancelInvitation(id)) });
    else if (name === "updateRoles") open({ title: "Update roles", message: `Change roles for ${admin?.name || "this admin"}?`, confirmLabel: "Update roles", requireReason: true, onConfirm: ({ reason }) => perform("updateRoles", () => adminTeamService.assignRole(id, (admin?.roles || []).join(","), reason)) });
  };
  const handleRoleToggle = (role) => { setAdmin(prev => { const roles = prev?.roles || []; const next = roles.includes(role) ? roles.filter(r => r !== role) : [...roles, role]; return { ...prev, roles: next }; }); };

  if (isNew) return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.TEAM_VIEW]}>
      <AdminLayout>
        <div className={styles.page}><button className={styles.backLink} onClick={() => router.push("/dashboard/team")}><ArrowBackOutlinedIcon className={styles.backIcon} /> Back to team</button>
        <InviteForm onInvite={handleInvite} isSending={actionLoading === "invite"} onCancel={() => router.push("/dashboard/team")} /></div>
      </AdminLayout></AdminRouteGuard>);
  if (isLoading) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.TEAM_VIEW]}><AdminLayout><div className={styles.loadingPage}><div className={styles.loadingSpinner} /></div></AdminLayout></AdminRouteGuard>);
  if (error && !admin) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.TEAM_VIEW]}><AdminLayout><div className={styles.errorCard}><ErrorOutlineIcon className={styles.errorIcon} /><h2 className={styles.errorTitle}>Failed to load</h2><p className={styles.errorMessage}>{error}</p><button className={styles.retryButton} onClick={fetchAdmin}>Retry</button></div></AdminLayout></AdminRouteGuard>);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.TEAM_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button className={styles.backLink} onClick={() => router.push("/dashboard/team")}><ArrowBackOutlinedIcon className={styles.backIcon} /> Back to team</button>
          <AdminDetailCard admin={admin} isLoading={false} />
          <AdminActions admin={admin} currentAdminId={currentAdminId} onAction={handleAction} isActionLoading={actionLoading} />
          <div className={styles.grid}>
            <RoleAssignment admin={admin} currentAdminId={currentAdminId} onAssign={handleRoleToggle} isActionLoading={actionLoading} />
            <PermissionInspector permissions={permissions} isLoading={false} />
          </div>
          <AdminActivity activities={activities} isLoading={false} />
          <ConfirmActionModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger} requireReason={confirmModal.requireReason} onConfirm={confirmModal.onConfirm} onCancel={close} isLoading={!!actionLoading} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
