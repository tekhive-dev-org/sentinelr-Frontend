import { useCallback, useEffect, useMemo, useState } from "react";
import { alertsService } from "../../../services/alertsService";
import { devicesService } from "../../../services/devicesService";

const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const isActiveAlert = (alert) => {
  const status = String(alert?.status || "").toLowerCase();
  return status === "active" || status === "unresolved" || (!status && !alert?.resolvedAt && !alert?.dismissedAt);
};

const getAlertDateValue = (alert) => alert?.createdAt || alert?.timestamp || alert?.updatedAt || alert?.date;

export default function useUserDashboardStats() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({ devices: "", alerts: "", sos: "" });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    setErrors({ devices: "", alerts: "", sos: "" });

    try {
      const [devicesResult, alertsResult, sosResult] = await Promise.allSettled([
        devicesService.getFamilyDevices({ pairStatus: "Paired" }),
        alertsService.getAlerts({ limit: 100 }),
        alertsService.getSOSAlerts(),
      ]);

      if (devicesResult.status === "fulfilled") {
        setDevices(devicesResult.value?.devices || []);
      } else {
        setDevices([]);
        setErrors((current) => ({ ...current, devices: "Unable to load devices." }));
      }

      if (alertsResult.status === "fulfilled") {
        setAlerts(alertsResult.value?.alerts || []);
      } else {
        setAlerts([]);
        setErrors((current) => ({ ...current, alerts: "Unable to load alerts." }));
      }

      if (sosResult.status === "fulfilled") {
        setSosAlerts(sosResult.value?.alerts || []);
      } else {
        setSosAlerts([]);
        setErrors((current) => ({ ...current, sos: "Unable to load SOS alerts." }));
      }

      const failures = [devicesResult, alertsResult, sosResult].filter((result) => result.status === "rejected");
      if (failures.length === 3) {
        throw failures[0].reason;
      }
    } catch (err) {
      setDevices([]);
      setAlerts([]);
      setSosAlerts([]);
      setError(err?.message || "Unable to load dashboard stats.");
      setErrors({
        devices: "Unable to load devices.",
        alerts: "Unable to load alerts.",
        sos: "Unable to load SOS alerts.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const activeDevices = devices.filter((device) => String(device.status || "").toLowerCase() === "online");
    const pairedDevices = devices.filter((device) => {
      const pairStatus = String(device.pairStatus || "").toLowerCase();
      return pairStatus === "paired" || !pairStatus;
    });
    const alertsToday = alerts.filter((alert) => isToday(alert.createdAt || alert.timestamp));
    const activeSos = sosAlerts.filter(isActiveAlert);
    const recentAlerts = [...alerts]
      .sort((first, second) => {
        const firstDate = new Date(getAlertDateValue(first)).getTime() || 0;
        const secondDate = new Date(getAlertDateValue(second)).getTime() || 0;
        return secondDate - firstDate;
      })
      .slice(0, 6);

    const seen = new Set();
    const avatarUsers = [];
    activeDevices.forEach((device) => {
      const name = device.assignedUser?.name || device.deviceName || device.name || "Device";
      const key = device.assignedUser?.id ?? name;
      if (!seen.has(key)) {
        seen.add(key);
        avatarUsers.push(name);
      }
    });

    return {
      activeDevices,
      pairedDevices,
      alertsToday,
      activeSos,
      recentAlerts,
      deviceAvatarNames: avatarUsers,
    };
  }, [alerts, devices, sosAlerts]);

  return {
    devices,
    alerts,
    sosAlerts,
    stats,
    loading,
    error,
    errors,
    refresh,
  };
}
