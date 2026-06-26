import React from "react";
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
import { useAuth } from "../../../../context/AuthContext";
import { useDevicesAndUsers, VIEW_MODES } from "./hooks/useDevicesAndUsers";

export default function DevicesAndUsers() {
  const { user } = useAuth();

  const {
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
    handleUpdateDevice,
    filteredDevices,
    filteredUsers,
  } = useDevicesAndUsers({ user });

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
                  color: "#b98b0e",
                  backgroundColor: "#fff8e8",
                  border: "1px solid #f3d476",
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
                color: "#b98b0e",
                backgroundColor: "#fff8e8",
                border: "1px solid #f3d476",
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
      initialDevice={repairingDevice}
    />
  );

  return (
    <div className={styles.container}>
      {/* Warning Banner — hidden once family members exist */}
      {showWarning && users.length === 0 && (
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
        onRepair={handleRepairDevice}
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
