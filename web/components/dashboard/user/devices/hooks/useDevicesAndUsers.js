import { useState, useEffect, useCallback, useRef } from "react";
import { familyService } from "../../../../../services/familyService";
import { devicesService } from "../../../../../services/devicesService";
import {
  useDevicesSubscription,
  useFamilyMembersSubscription,
} from "../../../../../context/RealtimeSubscriptionContext";

export const VIEW_MODES = {
  LIST: "list",
  PAIRING: "pairing",
};

export function useDevicesAndUsers({ user }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [activeTab, setActiveTab] = useState("devices");
  const [showWarning, setShowWarning] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [familyId, setFamilyId] = useState(null);

  // Confirmation Modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
    confirmText: "Confirm",
  });

  // Data states
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [maxMembers, setMaxMembers] = useState(null); // from family.maxMembers
  const [repairingDevice, setRepairingDevice] = useState(null);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Filter states
  const [pairStatusFilter, setPairStatusFilter] = useState("all");

  const showNotification = (message, type = "success") => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((prev) => {
        return prev && prev.message === message ? null : prev;
      });
    }, 3000);
  };

  // Keep a ref to pairStatusFilter so real-time callbacks always use the latest value
  const pairStatusFilterRef = useRef(pairStatusFilter);
  pairStatusFilterRef.current = pairStatusFilter;

  // Fetch family members helper (memoized — no external deps)
  const fetchMembers = useCallback(async () => {
    try {
      const membersResponse = await familyService.getFamilyMembers();
      const family = membersResponse?.family;
      if (family?.id) {
        setFamilyId(family.id);
      }
      if (family?.maxMembers != null) {
        setMaxMembers(family.maxMembers);
      }

      const members = family?.members || membersResponse?.members || [];
      const mapped = members.map((m) => {
        const user = m.user || m;
        return {
          id: m.userId || m.id || user.id,
          name: user.userName || user.name || m.userName || m.name || "Unknown",
          email: user.email || m.email || "",
          phone: user.phone || user.phoneNumber || m.phone || m.phoneNumber || "",
          role: m.relationship || m.role || user.role || "Member",
          status: m.status || user.status || "offline",
        };
      });
      setUsers(mapped);
    } catch (err) {
      console.error("Failed to fetch family members:", err);
    }
  }, []);

  // Fetch devices helper (memoized — depends on pairStatusFilter)
  const fetchDevices = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingDevices(true);
      const currentFilter = pairStatusFilterRef.current;
      const response = await devicesService.getFamilyDevices({
        pairStatus: currentFilter,
        limit: 50,
      });

      if (response && response.devices) {
        // Fetch each device's details in parallel to get brand
        const enrichedDevices = await Promise.all(
          response.devices.map(async (d) => {
            try {
              const detail = await devicesService.getDevice(d.id);
              
              return { ...d, brand: detail?.brand || detail?.device?.brand || null };
            } catch {
              return { ...d, brand: null };
            }
          })
        );

        setDevices(
          enrichedDevices.map((d) => ({
            ...d,
            status:
              d.status ||
              (d.pairStatus === "Paired" || d.pairStatus === "paired"
                ? "online"
                : "offline"),
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      if (!silent) setLoadingDevices(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoadingMembers(true);
      setLoadingDevices(true);
      await Promise.all([fetchMembers(), fetchDevices()]);
      setLoadingMembers(false);
      setLoadingDevices(false);
    };

    loadData();
  }, [user, fetchMembers, fetchDevices]);

  // Fetch devices when filter changes
  useEffect(() => {
    if (!user) return;
    fetchDevices();
  }, [pairStatusFilter, fetchDevices]);

  // Real-time subscriptions via centralized service
  // deps [] is intentional — onDataRef in the hook always calls the latest callback,
  // so we don't need to resubscribe when the callback reference changes
  useFamilyMembersSubscription(
    () => { fetchMembers(); },
    { familyId },
    [],
  );

  useDevicesSubscription(
    () => { fetchDevices({ silent: true }); },
    [],
  );

  // Polling fallback: re-fetch devices every 30s so the table stays current
  // even if Supabase Realtime isn't enabled for the Devices table
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchDevices({ silent: true });
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchDevices]);

  const handleAddMember = async (memberData, apiResponse) => {
    if (apiResponse) {
      await fetchMembers();
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handlePairingComplete = () => {
    setRepairingDevice(null);
    fetchDevices();
    handleViewDevices();
  };

  const handleViewDevices = () => {
    setRepairingDevice(null);
    setViewMode(VIEW_MODES.LIST);
    setActiveTab("devices");
  };

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  const handleCancelPairing = () => {
    setRepairingDevice(null);
    setViewMode(VIEW_MODES.LIST);
  };

  const handleStartPairing = () => {
    if (maxMembers != null && devices.length >= maxMembers) {
      showNotification(
        `Device limit reached. Your plan allows up to ${maxMembers} device${maxMembers !== 1 ? "s" : ""}.`,
        "error",
      );
      return;
    }
    setRepairingDevice(null);
    setViewMode(VIEW_MODES.PAIRING);
  };

  const handleUnpairDevice = (device) => {
    setConfirmationModal({
      isOpen: true,
      title: "Unpair Device",
      message: `Are you sure you want to unpair "${device.deviceName || device.name}"? The device will remain on your dashboard with an "Unpaired" status and can be re-paired later.`,
      confirmText: "Unpair",
      isDanger: false,
      onConfirm: async () => {
        try {
          await devicesService.unpairDevice(device.id);
          await fetchDevices();
          setSelectedDevice((prev) =>
            prev ? { ...prev, pairStatus: "Unpaired" } : null,
          );
          showNotification("Device unpaired successfully", "success");
        } catch (err) {
          console.error("Failed to unpair device:", err);
          showNotification("Failed to unpair device.", "error");
        }
      },
    });
  };

  const handleRepairDevice = (device) => {
    setConfirmationModal({
      isOpen: true,
      title: "Re-pair Device",
      message: `Re-pairing "${device.deviceName || device.name}" will remove this old device record and start a fresh pairing session. Continue?`,
      confirmText: "Remove and Re-pair",
      isDanger: true,
      onConfirm: async () => {
        try {
          await devicesService.removeDevice(device.id);
          await fetchDevices();
          setSelectedDevice(null);
          setRepairingDevice(device);
          setViewMode(VIEW_MODES.PAIRING);
          showNotification(
            "Old device removed. Complete pairing to add it again.",
            "success",
          );
        } catch (err) {
          console.error("Failed to re-pair device:", err);
          showNotification("Failed to start re-pair flow.", "error");
        }
      },
    });
  };

  const handleRemoveDevice = (device) => {
    setConfirmationModal({
      isOpen: true,
      title: "Remove from Dashboard",
      message: `Are you sure you want to remove "${device.deviceName || device.name}" from your dashboard? This will hide the device from your view.`,
      confirmText: "Remove",
      isDanger: true,
      onConfirm: async () => {
        try {
          await devicesService.removeDevice(device.id);
          fetchDevices();
          setSelectedDevice(null);
          showNotification("Device removed from dashboard", "success");
        } catch (err) {
          console.error("Failed to remove device:", err);
          showNotification("Failed to remove device.", "error");
        }
      },
    });
  };

  const handleRemoveMember = (member) => {
    if (!familyId) {
      showNotification("No family found. Cannot remove member.", "error");
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: "Remove Family Member",
      message: `Are you sure you want to remove "${member.name}" from your family? This action cannot be undone. ${member.name} will lose access to all family features and their devices will be unlinked.`,
      confirmText: "Remove Member",
      isDanger: true,
      onConfirm: async () => {
        try {
          await familyService.removeFamilyMember(familyId, member.id);
          await fetchMembers();
          setSelectedUser(null);
          showNotification(`${member.name} has been removed from the family.`, "success");
        } catch (err) {
          console.error("Failed to remove family member:", err);
          showNotification("Failed to remove family member. Please try again.", "error");
        }
      },
    });
  };

  const handleUpdateDevice = async (deviceId, updates) => {
    const response = await devicesService.updateDevice(deviceId, updates);
    await fetchDevices();
    if (response?.device) {
      setSelectedDevice((prev) => ({
        ...prev,
        ...response.device,
        userId:
          response.device.assignedUserId ??
          response.device.userId ??
          prev?.userId,
      }));
    }
    showNotification("Device updated successfully", "success");
    return response;
  };

  const filteredDevices = devices.filter((device) => {
    const name = (device.deviceName || device.name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    showWarning,
    setShowWarning,
    searchQuery,
    setSearchQuery,
    isAddMemberModalOpen,
    setIsAddMemberModalOpen,
    selectedUser,
    setSelectedUser,
    selectedDevice,
    setSelectedDevice,
    familyId,
    confirmationModal,
    setConfirmationModal,
    loadingMembers,
    loadingDevices,
    devices,
    users,
    maxMembers,
    repairingDevice,
    setRepairingDevice,
    notification,
    setNotification,
    pairStatusFilter,
    setPairStatusFilter,
    showNotification,
    handleAddMember,
    handleUserClick,
    handlePairingComplete,
    handleViewDevices,
    handleDeviceClick,
    handleCancelPairing,
    handleStartPairing,
    handleUnpairDevice,
    handleRepairDevice,
    handleRemoveDevice,
    handleRemoveMember,
    handleUpdateDevice,
    filteredDevices,
    filteredUsers,
  };
}
