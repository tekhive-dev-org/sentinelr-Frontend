import React, { useState, useEffect } from "react";
import styles from "./DevicesAndUsers.module.css";
import DevicesList from "./DevicesList";
import UsersList from "./UsersList";
import PairDevice from "./PairDevice";
import AddMemberModal from "./AddMemberModal";
import DeviceDetailModal from "./DeviceDetailModal";
import UserDetailModal from "./UserDetailModal";
import ConfirmationModal from "./ConfirmationModal";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { familyService } from "../../../../services/familyService";
import { devicesService } from "../../../../services/devicesService";
import { supabase } from "../../../../services/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";

// View modes
const VIEW_MODES = {
  LIST: "list",
  PAIRING: "pairing",
};

export default function DevicesAndUsers() {
  const { user } = useAuth();

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

  // Notification state
  const [notification, setNotification] = useState(null);

  // console.log(devices);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type, id: Date.now() });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification((prev) => {
        // Only clear if it's the same notification (check by ID if we tracked it, but simple clearing works for now)
        return prev && prev.message === message ? null : prev;
      });
    }, 3000);
  };

  // Filter states
  const [pairStatusFilter, setPairStatusFilter] = useState("all");

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
  }, [user]);

  // Fetch devices when filter changes
  useEffect(() => {
    if (!user) return;
    fetchDevices();
  }, [pairStatusFilter]);

  // Fetch family members helper
  const fetchMembers = async () => {
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
        // The API may return user data flat (m.userName) or nested (m.user.userName)
        const user = m.user || m;
        return {
          id: m.userId || m.id || user.id,
          name: user.userName || user.name || m.userName || m.name || "Unknown",
          email: user.email || m.email || "",
          phone:
            user.phone || user.phoneNumber || m.phone || m.phoneNumber || "",
          role: m.relationship || m.role || user.role || "Member",
          status: m.status || user.status || "offline",
        };
      });
      // console.log("[fetchMembers] mapped:", mapped);  // Debug: confirm id & name values
      setUsers(mapped);
    } catch (err) {
      console.error("Failed to fetch family members:", err);
    }
  };

  // Fetch devices helper
  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const response = await devicesService.getFamilyDevices({
        pairStatus: pairStatusFilter,
        limit: 50, // Fetch more to safe
      });

      if (response && response.devices) {
        setDevices(
          response.devices.map((d) => ({
            ...d,
            // Ensure status mapping matches UI expectations
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
      setLoadingDevices(false);
    }
  };

  // Real-time subscriptions — keyed on familyId so they only run once per session
  useEffect(() => {
    if (!familyId) return;

    // Family members channel
    const membersChannel = supabase
      .channel("family-members-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "FamilyMembers",
          filter: `familyId=eq.${familyId}`,
        },
        () => {
          fetchMembers();
        },
      )
      .subscribe();

    // Devices channel — no filter (RLS scopes to authenticated user)
    const devicesChannel = supabase
      .channel("family-devices-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Devices",
        },
        (payload) => {
          console.log("[Realtime] Device change:", payload.eventType);
          fetchDevices();
        },
      )
      .subscribe((status, err) => {
        console.log("[Realtime] Devices channel status:", status);
        if (err) console.error("[Realtime] Devices channel error:", err);
      });

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(devicesChannel);
    };
  }, [familyId]);

  // Handle add new member
  const handleAddMember = async (memberData, apiResponse) => {
    console.log("Add member API response:", apiResponse);

    // Refresh members from API after successful add
    // Refresh members from API after successful add
    // AddMemberModal only calls this on success, so we can always refresh
    if (apiResponse) {
      await fetchMembers();
    } else {
      console.error("Failed to add member - API response:", apiResponse);
    }
  };

  // Handle user click to open detail modal
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  // Handle successful pairing
  const handlePairingComplete = (deviceData) => {
    // Refresh list to show new device
    fetchDevices();
    handleViewDevices();
  };

  // Handle view devices after pairing
  const handleViewDevices = () => {
    setViewMode(VIEW_MODES.LIST);
    setActiveTab("devices");
  };

  // Handle device click to open detail modal
  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  // Handle cancel pairing
  const handleCancelPairing = () => {
    setViewMode(VIEW_MODES.LIST);
  };

  // Start pairing flow
  const handleStartPairing = () => {
    if (maxMembers != null && devices.length >= maxMembers) {
      showNotification(
        `Device limit reached. Your plan allows up to ${maxMembers} device${maxMembers !== 1 ? "s" : ""}.`,
        "error",
      );
      return;
    }
    setViewMode(VIEW_MODES.PAIRING);
  };

  // Handle unpair device — changes pairStatus to "Unpaired", device stays on dashboard
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
          // Update the selected device's pairStatus locally so the modal reflects the change
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

  // Handle re-pair device — closes detail modal and opens pairing screen
  const handleRepairDevice = (device) => {
    setSelectedDevice(null);
    handleStartPairing();
  };

  // Handle remove device from dashboard (soft-delete — hides it from view)
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

  // Handle update device (also used for reassign via the edit form)
  const handleUpdateDevice = async (deviceId, updates) => {
    const response = await devicesService.updateDevice(deviceId, updates);
    // Refresh list and update the selected device with new data
    await fetchDevices();
    if (response?.device) {
      setSelectedDevice((prev) => ({
        ...prev,
        ...response.device,
        // The DB stores the assignment as `userId`, but the PATCH response
        // returns it as `assignedUserId` — keep them in sync so the modal
        // displays correctly before the next full refresh
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

  // Get warning banner content based on view mode
  const getWarningContent = () => {
    if (viewMode === VIEW_MODES.PAIRING) {
      return (
        <ol className={styles.warningList}>
          <li>Install the Sentinelr app on the device</li>
          <li>Open the app and choose "Pair Device"</li>
          <li>Enter this code or scan the QR</li>
          <li>Enable Permissions</li>
        </ol>
      );
    }
    return (
      <span>
        Please, create a profile first before adding a device to track.
      </span>
    );
  };

  // Render list view
  const renderListView = () => (
    <>
      {/* Add Button - shown when items exist */}
      {(activeTab === "devices" ? devices.length > 0 : users.length > 0) && (
        <div className={styles.headerActions}>
          {activeTab === "devices" ? (
            maxMembers != null && devices.length >= maxMembers ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#b45309",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fcd34d",
                  borderRadius: "8px",
                  padding: "6px 14px",
                }}
              >
                Device limit reached ({devices.length}/{maxMembers})
              </div>
            ) : (
              <button
                className={styles.addDevicesBtn}
                onClick={handleStartPairing}
              >
                + Add Devices
                <span className={styles.addDevicesBtnArrow}>›</span>
              </button>
            )
          ) : maxMembers != null && users.length >= maxMembers ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#b45309",
                backgroundColor: "#fffbeb",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                padding: "6px 14px",
              }}
            >
              Member limit reached ({users.length}/{maxMembers})
            </div>
          ) : (
            <button
              className={styles.addDevicesBtn}
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              + Add Family Member
              <span className={styles.addDevicesBtnArrow}>›</span>
            </button>
          )}
        </div>
      )}

      {/* Devices List Card */}
      <div className={styles.listCard}>
        <h2 className={styles.listTitle}>
          {activeTab === "devices" ? "Devices List" : "All Family Members"}
        </h2>

        <div className={styles.controlsRow}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "devices" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("devices")}
            >
              Devices
            </button>
            <button
              className={`${styles.tab} ${activeTab === "users" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Users/Members
            </button>
          </div>

          <div className={styles.controlsRight}>
            {/* Status Filter (Only for Devices tab) */}
            {activeTab === "devices" && (
              <select
                className={styles.statusSelect}
                value={pairStatusFilter}
                onChange={(e) => setPairStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paired">Paired</option>
                <option value="unpaired">Unpaired</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            )}

            {/* Search */}
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder={
                  activeTab === "devices"
                    ? "Search for a device..."
                    : "Search..."
                }
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === "devices" ? (
            <DevicesList
              devices={filteredDevices}
              onAddDevice={handleStartPairing}
              onDeviceClick={handleDeviceClick}
              loading={loadingDevices}
              isAtDeviceLimit={
                maxMembers != null && devices.length >= maxMembers
              }
              maxDevices={maxMembers}
            />
          ) : (
            <UsersList
              users={filteredUsers}
              onAddUser={() => {
                if (maxMembers != null && users.length >= maxMembers) {
                  showNotification(
                    `Member limit reached. Your plan allows up to ${maxMembers} member${maxMembers !== 1 ? "s" : ""}.`,
                    "error",
                  );
                  return;
                }
                setIsAddMemberModalOpen(true);
              }}
              onUserClick={handleUserClick}
              loading={loadingMembers}
              devices={devices}
              isAtMemberLimit={maxMembers != null && users.length >= maxMembers}
              maxMembers={maxMembers}
            />
          )}
        </div>
      </div>
    </>
  );

  // Render pairing view
  const renderPairingView = () => (
    <PairDevice
      onComplete={handlePairingComplete}
      onCancel={handleCancelPairing}
      onViewDevices={handleViewDevices}
      familyMembers={users}
    />
  );

  return (
    <div className={styles.container}>
      {/* Warning Banner */}
      {showWarning && (
        <div className={styles.warningBanner}>
          <div className={styles.warningContent}>
            <svg
              className={styles.warningIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V14M12 21.41H5.94C2.47 21.41 1.02 18.93 2.7 15.9L5.82 10.28L8.76 5C10.54 1.79 13.46 1.79 15.24 5L18.18 10.29L21.3 15.91C22.98 18.94 21.52 21.42 18.06 21.42H12V21.41Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.995 17H12.004"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {getWarningContent()}
          </div>
          <button
            className={styles.warningClose}
            onClick={() => setShowWarning(false)}
          >
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      )}

      {/* Main Content based on view mode */}
      {viewMode === VIEW_MODES.LIST ? renderListView() : renderPairingView()}

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
        familyId={familyId}
      />
      {/* Notification Toast */}
      {notification && (
        <div className={styles.notificationContainer}>
          <div
            className={`${styles.notification} ${
              notification.type === "success"
                ? styles.notificationSuccess
                : styles.notificationError
            }`}
          >
            <div className={styles.notificationIcon}>
              {notification.type === "success" ? (
                <CheckCircleIcon fontSize="inherit" />
              ) : (
                <ErrorIcon fontSize="inherit" />
              )}
            </div>
            <div className={styles.notificationMessage}>
              {notification.message}
            </div>
            <button
              className={styles.notificationClose}
              onClick={() => setNotification(null)}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}
      <UserDetailModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        device={devices
          .map((d) => ({
            ...d,
          }))
          .find((d) => d.assignedUser?.id === selectedUser?.id)} // Pass the device associated with the user, if any
        user={selectedUser}
        onPairDevice={(user) => {
          setSelectedUser(null);
          handleStartPairing();
        }}
      />
      <DeviceDetailModal
        isOpen={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
        device={selectedDevice}
        onUnpair={handleUnpairDevice}
        onRemove={handleRemoveDevice}
        onRepair={handleUnpairDevice}
        onUpdate={handleUpdateDevice}
        familyMembers={users}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        isDanger={confirmationModal.isDanger}
      />
    </div>
  );
}
