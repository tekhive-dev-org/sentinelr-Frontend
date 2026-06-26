import React from "react";
import Image from "next/image";
import styles from "./DevicesAndUsers.module.css";
import { TableSkeleton } from "../../../ui/loaders";
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
  if (loading) {
    return <TableSkeleton rows={5} columns={6} />;
  }

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
      <div className={styles.tableMetaRow}>
        <span className={styles.tableCountText}>
          {users.length}
          {maxMembers != null ? ` / ${maxMembers}` : ""} member
          {users.length !== 1 ? "s" : ""}
        </span>

        {isAtMemberLimit && (
          <div className={styles.limitBadge}>
            <BlockIcon className={styles.limitBadgeIcon} />
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
                  <MoreVertIcon className={styles.tableActionIcon} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
