import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { adminDevicesService } from "../../../services/adminDevicesService";
import {
  DeviceDetailCard,
  DeviceDetailOwner,
  DeviceDetailConnection,
  DeviceDetailPairing,
  DeviceDetailEvents,
  DeviceActions,
} from "../../../components/devices";
import { ConfirmActionModal } from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./detail.module.css";

export default function DeviceDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, requireReason: false, onConfirm: null,
  });

  const fetchDevice = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminDevicesService.getDeviceDetail(id);
      setDevice(data?.device || data);
    } catch (err) {
      setError(err.message || "Failed to load device");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDevice(); }, [fetchDevice]);

  const performAction = async (name, fn) => {
    setActionLoading(name);
    try { await fn(); await fetchDevice(); }
    catch (err) { setError(err.message || `Action ${name} failed`); }
    finally { setActionLoading(null); }
  };

  const openConfirm = (cfg) => setConfirmModal({ isOpen: true, ...cfg });
  const closeConfirm = () => setConfirmModal((p) => ({ ...p, isOpen: false }));

  const handleAction = (actionName) => {
    if (actionName === "revoke") {
      openConfirm({ title: "Revoke device session", message: `Revoke access for ${device?.name || "this device"}? The device will be unusable until re-paired.`, confirmLabel: "Revoke session", isDanger: true, requireReason: true, onConfirm: ({ reason }) => performAction("revoke", () => adminDevicesService.revokeDevice(id, reason)) });
    } else if (actionName === "unpair") {
      openConfirm({ title: "Unpair device", message: `Unpair ${device?.name || "this device"}? The owner will need to re-pair it.`, confirmLabel: "Unpair device", isDanger: true, requireReason: true, onConfirm: ({ reason }) => performAction("unpair", () => adminDevicesService.unpairDevice(id, reason)) });
    } else if (actionName === "flag") {
      openConfirm({ title: "Flag for investigation", message: `Flag ${device?.name || "this device"} for security investigation?`, confirmLabel: "Flag device", isDanger: true, requireReason: true, onConfirm: ({ reason }) => performAction("flag", () => adminDevicesService.flagDevice(id, reason)) });
    } else if (actionName === "reauth") {
      openConfirm({ title: "Request re-authentication", message: `Request ${device?.name || "this device"} to re-authenticate?`, confirmLabel: "Request re-auth", onConfirm: () => performAction("reauth", () => adminDevicesService.requestReauth(id)) });
    } else if (actionName === "addNote") {
      openConfirm({ title: "Add internal note", message: "This note is only visible to administrators.", confirmLabel: "Add note", requireReason: true, onConfirm: ({ reason }) => performAction("addNote", () => adminDevicesService.addDeviceNote(id, reason)) });
    } else if (actionName === "viewLogs") {
      router.push(`/dashboard/devices/${id}?tab=logs`);
    }
  };

  if (isLoading) {
    return (
      <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.DEVICES_VIEW]}>
        <AdminLayout>
          <div className={styles.loadingPage}><div className={styles.loadingSpinner} aria-label="Loading device details" /></div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  if (error && !device) {
    return (
      <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.DEVICES_VIEW]}>
        <AdminLayout>
          <div className={styles.errorCard}>
            <ErrorOutlineIcon className={styles.errorIcon} />
            <h2 className={styles.errorTitle}>Failed to load device</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button type="button" className={styles.retryButton} onClick={fetchDevice}>Retry</button>
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.DEVICES_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button type="button" className={styles.backLink} onClick={() => router.push("/dashboard/devices")}>
            <ArrowBackOutlinedIcon className={styles.backIcon} /> Back to devices
          </button>

          <div className={styles.profileHeader}>
            <DeviceDetailCard device={device} isLoading={false} />
          </div>

          <DeviceActions device={device} onAction={handleAction} isActionLoading={actionLoading} />

          <div className={styles.grid}>
            <DeviceDetailOwner device={device} isLoading={false} />
            <DeviceDetailConnection device={device} isLoading={false} />
            <DeviceDetailPairing pairingHistory={device?.pairingHistory || null} isLoading={false} />
            <DeviceDetailEvents sosEvents={device?.sosEvents || null} geofenceEvents={device?.geofenceEvents || null} isLoading={false} />
          </div>

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
