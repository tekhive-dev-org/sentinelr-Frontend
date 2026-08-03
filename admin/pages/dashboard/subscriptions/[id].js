import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import { adminSubscriptionsService } from "../../../services/adminSubscriptionsService";
import {
  SubscriptionDetailCard, SubscriptionLifecycle, SubscriptionPaymentHistory,
  SubscriptionInvoices, SubscriptionLimits, SubscriptionActions,
} from "../../../components/subscriptions";
import { ConfirmActionModal } from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./detail.module.css";

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { adminUser } = useAdminAuth();
  const canManage = adminUser?.permissions?.includes(ADMIN_PERMISSIONS.SUBSCRIPTIONS_MANAGE) || false;

  const [sub, setSub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", isDanger: false, requireReason: false, onConfirm: null });

  const fetchSub = useCallback(async () => {
    if (!id) return;
    setIsLoading(true); setError(null);
    try { const data = await adminSubscriptionsService.getSubscriptionDetail(id); setSub(data?.subscription || data); }
    catch (err) { setError(err.message || "Failed to load subscription"); }
    finally { setIsLoading(false); }
  }, [id]);
  useEffect(() => { fetchSub(); }, [fetchSub]);

  const perform = async (name, fn) => {
    setActionLoading(name);
    try { await fn(); await fetchSub(); } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };
  const open = (cfg) => setConfirmModal({ isOpen: true, ...cfg });
  const close = () => setConfirmModal((p) => ({ ...p, isOpen: false }));

  const handleAction = (name, args) => {
    if (name === "changePlan") open({ title: "Change plan", message: `Change ${sub?.userName || "this subscriber"} to a different plan?`, confirmLabel: "Change plan", requireReason: true, onConfirm: ({ reason }) => perform("changePlan", () => adminSubscriptionsService.changePlan(id, { newPlanId: args?.planId, reason })) });
    else if (name === "grantTrial") open({ title: "Grant trial", message: `Grant a trial period?`, confirmLabel: "Grant trial", requireReason: true, onConfirm: ({ reason }) => perform("grantTrial", () => adminSubscriptionsService.grantTrial(id, { durationDays: args?.days || 14, reason })) });
    else if (name === "extendTrial") open({ title: "Extend trial", message: `Extend the current trial?`, confirmLabel: "Extend trial", requireReason: true, onConfirm: ({ reason }) => perform("extendTrial", () => adminSubscriptionsService.extendTrial(id, { additionalDays: args?.days || 7, reason })) });
    else if (name === "cancelPeriodEnd") open({ title: "Cancel at period end", message: `Cancel at the end of the current billing period? The subscription will remain active until then.`, confirmLabel: "Cancel at period end", isDanger: true, requireReason: true, onConfirm: ({ reason }) => perform("cancelPeriodEnd", () => adminSubscriptionsService.cancelAtPeriodEnd(id, reason)) });
    else if (name === "cancelImmediately") open({ title: "Cancel immediately", message: `Immediately cancel this subscription? The subscriber will lose access now. This cannot be easily reversed.`, confirmLabel: "Cancel immediately", isDanger: true, requireReason: true, onConfirm: ({ reason }) => perform("cancelImmediately", () => adminSubscriptionsService.cancelImmediately(id, reason)) });
    else if (name === "reactivate") open({ title: "Reactivate subscription", message: `Reactivate this subscription?`, confirmLabel: "Reactivate", requireReason: true, onConfirm: ({ reason }) => perform("reactivate", () => adminSubscriptionsService.reactivate(id, reason)) });
    else if (name === "manualEntitlement") open({ title: "Apply manual entitlement", message: `Grant a manual entitlement?`, confirmLabel: "Apply", requireReason: true, onConfirm: ({ reason }) => perform("manualEntitlement", () => adminSubscriptionsService.applyManualEntitlement(id, { entitlement: args?.entitlement, reason, expiryDate: args?.expiryDate })) });
    else if (name === "offlinePayment") open({ title: "Record offline payment", message: `Record an offline payment for this subscription? Only proceed if you are authorized.`, confirmLabel: "Record payment", requireReason: true, onConfirm: ({ reason }) => perform("offlinePayment", () => adminSubscriptionsService.recordOfflinePayment(id, { amount: args?.amount, currency: args?.currency || "USD", providerReference: args?.ref, reason, paymentDate: args?.date })) });
  };

  if (isLoading) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SUBSCRIPTIONS_VIEW]}><AdminLayout><div className={styles.loadingPage}><div className={styles.loadingSpinner} /></div></AdminLayout></AdminRouteGuard>);
  if (error && !sub) return (<AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SUBSCRIPTIONS_VIEW]}><AdminLayout><div className={styles.errorCard}><ErrorOutlineIcon className={styles.errorIcon} /><h2 className={styles.errorTitle}>Failed to load</h2><p className={styles.errorMessage}>{error}</p><button className={styles.retryButton} onClick={fetchSub}>Retry</button></div></AdminLayout></AdminRouteGuard>);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SUBSCRIPTIONS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button className={styles.backLink} onClick={() => router.push("/dashboard/subscriptions")}><ArrowBackOutlinedIcon className={styles.backIcon} /> Back to subscriptions</button>
          <SubscriptionDetailCard subscription={sub} isLoading={false} />
          <SubscriptionActions subscription={sub} onAction={handleAction} isActionLoading={actionLoading} canManage={canManage} />
          <div className={styles.grid}>
            <SubscriptionLifecycle subscription={sub} isLoading={false} />
            <SubscriptionLimits subscription={sub} isLoading={false} />
          </div>
          <SubscriptionPaymentHistory payments={sub?.payments || null} isLoading={false} />
          <SubscriptionInvoices invoices={sub?.invoices || null} isLoading={false} onDownload={(invId) => adminSubscriptionsService.downloadInvoice(id, invId)} onResend={(invId) => perform("resendInvoice", () => adminSubscriptionsService.resendInvoice(id, invId))} />
          <ConfirmActionModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger} requireReason={confirmModal.requireReason} onConfirm={confirmModal.onConfirm} onCancel={close} isLoading={!!actionLoading} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
