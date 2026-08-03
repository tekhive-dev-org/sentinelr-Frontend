import { API_BASE_URL } from "../config/api";
import { ApiError, createApiError, handleAuthorizationResponse } from "../utils/apiErrors";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) throw new ApiError("Your session has expired.", { status: 401 });
  const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-access-token": token, ...(options.headers || {}) }, ...options };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) { handleAuthorizationResponse(response, { endpoint }); const data = await response.json().catch(() => ({})); throw createApiError(response, data, `Request to ${endpoint} failed`); }
  return response.json();
}

export const adminSubscriptionsService = {

  async getSubscriptions(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page);
    if (params.limit) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search);
    if (params.status) q.set("status", params.status);
    if (params.plan) q.set("plan", params.plan);
    if (params.billingPeriod) q.set("billingPeriod", params.billingPeriod);
    if (params.renewalBefore) q.set("renewalBefore", params.renewalBefore);
    if (params.renewalAfter) q.set("renewalAfter", params.renewalAfter);
    if (params.provider) q.set("provider", params.provider);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    return apiRequest(`/admin/subscriptions${q.toString() ? `?${q}` : ""}`);
  },

  async getSubscriptionStats() {
    return apiRequest("/admin/subscriptions/stats");
  },

  async getSubscriptionDetail(subscriptionId) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}`);
  },

  async getSubscriberDetail(userId) {
    return apiRequest(`/admin/subscriptions/user/${userId}`);
  },

  async changePlan(subscriptionId, { newPlanId, reason }) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/change-plan`, {
      method: "PATCH", body: JSON.stringify({ planId: newPlanId, reason }),
    });
  },

  async grantTrial(subscriptionId, { durationDays, reason }) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/grant-trial`, {
      method: "PATCH", body: JSON.stringify({ durationDays, reason }),
    });
  },

  async extendTrial(subscriptionId, { additionalDays, reason }) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/extend-trial`, {
      method: "PATCH", body: JSON.stringify({ additionalDays, reason }),
    });
  },

  async cancelAtPeriodEnd(subscriptionId, reason) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/cancel`, {
      method: "PATCH", body: JSON.stringify({ immediate: false, reason }),
    });
  },

  async cancelImmediately(subscriptionId, reason) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/cancel`, {
      method: "PATCH", body: JSON.stringify({ immediate: true, reason }),
    });
  },

  async reactivate(subscriptionId, reason) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/reactivate`, {
      method: "PATCH", body: JSON.stringify({ reason }),
    });
  },

  async applyManualEntitlement(subscriptionId, { entitlement, reason, expiryDate }) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/manual-entitlement`, {
      method: "PATCH", body: JSON.stringify({ entitlement, reason, expiryDate }),
    });
  },

  async recordOfflinePayment(subscriptionId, { amount, currency, providerReference, reason, paymentDate }) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/offline-payment`, {
      method: "POST", body: JSON.stringify({ amount, currency, providerReference, reason, paymentDate }),
    });
  },

  async downloadInvoice(subscriptionId, invoiceId) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/invoices/${invoiceId}/download`);
  },

  async resendInvoice(subscriptionId, invoiceId) {
    return apiRequest(`/admin/subscriptions/${subscriptionId}/invoices/${invoiceId}/resend`, { method: "POST" });
  },
};
