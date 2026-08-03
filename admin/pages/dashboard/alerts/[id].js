import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { adminAlertsService } from "../../../services/adminAlertsService";
import {
  AlertDetailCard,
  AlertTimeline,
  AlertUserDevice,
  AlertLocation,
  AlertContacts,
  AlertRelated,
  AlertNotes,
  AlertAssignment,
  AlertStatusHistory,
  AlertResolution,
  AlertActions,
} from "../../../components/alerts";
import { ConfirmActionModal } from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./detail.module.css";

export default function AlertDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, requireReason: false, onConfirm: null,
  });

  const fetchAlert = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminAlertsService.getAlertDetail(id);
      setAlert(data?.alert || data);
    } catch (err) {
      setError(err.message || "Failed to load incident");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAlert(); }, [fetchAlert]);

  const performAction = async (name, fn) => {
    setActionLoading(name);
    try { await fn(); await fetchAlert(); }
    catch (err) { setError(err.message || `Action ${name} failed`); }
    finally { setActionLoading(null); }
  };

  const openConfirm = (cfg) => setConfirmModal({ isOpen: true, ...cfg });
  const closeConfirm = () => setConfirmModal((p) => ({ ...p, isOpen: false }));

  const handleAction = (actionName) => {
    if (actionName === "acknowledge") {
      performAction("acknowledge", () => adminAlertsService.acknowledgeAlert(id));
    } else if (actionName === "assign") {
      openConfirm({ title: "Assign incident", message: "Assign this incident to yourself?", confirmLabel: "Assign to me", onConfirm: () => performAction("assign", () => adminAlertsService.assignAlert(id, "me")) });
    } else if (actionName === "escalate") {
      openConfirm({ title: "Escalate incident", message: "Escalate this incident to the next response tier?", confirmLabel: "Escalate", isDanger: true, requireReason: true, onConfirm: ({ reason }) => performAction("escalate", () => adminAlertsService.escalateAlert(id, reason)) });
    } else if (actionName === "addNote") {
      openConfirm({ title: "Add note", message: "Internal note visible to all responders.", confirmLabel: "Add note", requireReason: true, onConfirm: ({ reason }) => performAction("addNote", () => adminAlertsService.addAlertNote(id, reason)) });
    } else if (actionName === "recordContact") {
      openConfirm({ title: "Record contact state", message: "Record the outcome of contacting this user.", confirmLabel: "Record contact", onConfirm: () => performAction("recordContact", () => adminAlertsService.recordContactState(id, "contacted")) });
    } else if (actionName === "falseAlarm") {
      openConfirm({ title: "Mark as false alarm", message: "Confirm this incident was a false alarm?", confirmLabel: "Mark false alarm", isDanger: true, requireReason: true, onConfirm: ({ reason }) => performAction("falseAlarm", () => adminAlertsService.markFalseAlarm(id, reason)) });
    } else if (actionName === "resolve") {
      openConfirm({ title: "Resolve incident", message: "Enter a mandatory resolution note.", confirmLabel: "Resolve incident", isDanger: true, requireReason: true, onConfirm: ({ reason }) => performAction("resolve", () => adminAlertsService.resolveAlert(id, reason)) });
    } else if (actionName === "reopen") {
      openConfirm({ title: "Reopen incident", message: "Reopen this resolved incident?", confirmLabel: "Reopen", requireReason: true, onConfirm: ({ reason }) => performAction("reopen", () => adminAlertsService.reopenAlert(id, reason)) });
    }
  };

  const isCritical = alert?.severity === "high" && alert?.status !== "resolved" && alert?.status !== "falseAlarm";

  if (isLoading) {
    return (
      <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.ALERTS_VIEW]}>
        <AdminLayout><div className={styles.loadingPage}><div className={styles.loadingSpinner} aria-label="Loading incident details" /></div></AdminLayout>
      </AdminRouteGuard>
    );
  }

  if (error && !alert) {
    return (
      <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.ALERTS_VIEW]}>
        <AdminLayout>
          <div className={styles.errorCard}>
            <ErrorOutlineIcon className={styles.errorIcon} />
            <h2 className={styles.errorTitle}>Failed to load incident</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button type="button" className={styles.retryButton} onClick={fetchAlert}>Retry</button>
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.ALERTS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button type="button" className={styles.backLink} onClick={() => router.push("/dashboard/alerts")}>
            <ArrowBackOutlinedIcon className={styles.backIcon} /> Back to incidents
          </button>

          {isCritical ? (
            <div className={styles.urgencyBanner}>
              <WarningAmberOutlinedIcon className={styles.urgencyIcon} />
              Critical incident — requires immediate attention
            </div>
          ) : null}

          <AlertDetailCard alert={alert} isLoading={false} />

          <AlertActions alert={alert} onAction={handleAction} isActionLoading={actionLoading} />

          <div className={styles.grid}>
            <AlertUserDevice alert={alert} isLoading={false} />
            <AlertLocation alert={alert} isLoading={false} />
            <AlertContacts alert={alert} isLoading={false} />
            <AlertRelated relatedAlerts={alert?.relatedAlerts || null} isLoading={false} />
          </div>

          <AlertTimeline timeline={alert?.timeline || null} isLoading={false} />

          <div className={styles.grid}>
            <AlertAssignment assignmentHistory={alert?.assignmentHistory || null} isLoading={false} />
            <AlertStatusHistory statusHistory={alert?.statusHistory || null} isLoading={false} />
            <AlertResolution alert={alert} isLoading={false} />
          </div>

          <AlertNotes
            notes={alert?.notes || null}
            isLoading={false}
            onAddNote={(note) => performAction("addNote", () => adminAlertsService.addAlertNote(id, note))}
            isAddingNote={actionLoading === "addNote"}
          />

          <ConfirmActionModal
            isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
            confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger}
            requireReason={confirmModal.requireReason} onConfirm={confirmModal.onConfirm}
            onCancel={closeConfirm} isLoading={!!actionLoading}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
