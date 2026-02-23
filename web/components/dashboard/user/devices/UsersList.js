import React from "react";
import Image from "next/image";
import styles from "./DevicesAndUsers.module.css";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";

export default function UsersList({
  devices = [],
  users = [],
  onAddUser,
  onUserClick,
  loading = false,
  isAtMemberLimit = false,
  maxMembers = null,
}) {
  if (users.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Image
          src="/assets/icons/user-empty.png"
          alt="No Family Members"
          width={120}
          height={120}
          className={styles.emptyIllustration}
        />
        <h3 className={styles.emptyTitle}>No Family Member Added Yet</h3>
        <p className={styles.emptyDescription}>
          To add new member to pair, please, click the add button.
        </p>

        <button
          className={styles.addButton}
          onClick={onAddUser}
          disabled={isAtMemberLimit}
          title={
            isAtMemberLimit ? `Member limit reached (${maxMembers})` : undefined
          }
          style={
            isAtMemberLimit
              ? { opacity: 0.5, cursor: "not-allowed" }
              : undefined
          }
        >
          <AddIcon className={styles.addButtonIcon} />
          Add Member
          <ChevronRightIcon className={styles.addButtonIcon} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.devicesTableContainer}>
      {/* Header row with member count + Add button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          padding: "0 4px",
        }}
      >
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          {users.length}
          {maxMembers != null ? ` / ${maxMembers}` : ""} member
          {users.length !== 1 ? "s" : ""}
        </span>

        {isAtMemberLimit && (
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
              padding: "6px 12px",
            }}
          >
            <BlockIcon style={{ fontSize: 15 }} />
            Member limit reached ({maxMembers})
          </div>
        )}
      </div>

      {/* Users Table */}
      <table className={styles.devicesTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className={styles.deviceNameCell}>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.role}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${devices?.find((d) => d.assignedUser?.id === user.id)?.status === "online" ? styles.statusOnlineBadge : styles.statusOfflineBadge}`}
                >
                  <span className={styles.statusDotSmall}></span>
                  {devices?.find((d) => d.assignedUser?.id === user.id)?.status === "online" ? "Online" : "Offline"}
                </span>
              </td>
              <td>
                <button
                  className={styles.tableActionBtn}
                  onClick={() => onUserClick && onUserClick(user)}
                >
                  <MoreVertIcon style={{ fontSize: 18 }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
