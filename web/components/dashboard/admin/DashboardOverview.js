import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import styles from "./DashboardOverview.module.css";
import adminService from "../../../services/adminService";

export default function DashboardOverview() {
  const [userData, setUserData] = useState({
    allUsers: 0,
    approvedAccounts: 0,
    blockedAccounts: 0,
    flaggedUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  const normalizeUser = (user) => {
    const isBlocked = Boolean(user.blocked);
    const isVerified = Boolean(user.verified);
    return {
      id: user.id,
      name: user.userName || user.name || user.fullName || "Unknown",
      email: user.email || "-",
      phone: user.phone || user.phoneNumber || "-",
      lastActive: formatDate(user.updatedAt || user.createdAt),
      status: isBlocked ? "Blocked" : isVerified ? "Approved" : "Flagged",
      raw: user,
    };
  };

  const fetchStats = async () => {
    try {
      const [allRes, blockedRes, verifiedRes, unverifiedRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getBlockedUsers(),
        adminService.getVerifiedUsers(true),
        adminService.getVerifiedUsers(false),
      ]);

      setUserData({
        allUsers: allRes?.count ?? allRes?.users?.length ?? 0,
        approvedAccounts: verifiedRes?.count ?? verifiedRes?.verifiedUsers?.length ?? 0,
        blockedAccounts: blockedRes?.count ?? blockedRes?.blockedUsers?.length ?? 0,
        flaggedUsers: unverifiedRes?.count ?? unverifiedRes?.verifiedUsers?.length ?? 0,
      });
    } catch (error) {
      setUserData({
        allUsers: 0,
        approvedAccounts: 0,
        blockedAccounts: 0,
        flaggedUsers: 0,
      });
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      if (activeTab === "All") {
        const data = await adminService.getAllUsers();
        setUsers((data?.users || []).map(normalizeUser));
      } else if (activeTab === "Blocked") {
        const data = await adminService.getBlockedUsers();
        setUsers((data?.blockedUsers || []).map(normalizeUser));
      } else if (activeTab === "Approved") {
        const data = await adminService.getVerifiedUsers(true);
        setUsers((data?.verifiedUsers || []).map(normalizeUser));
      } else {
        const data = await adminService.getVerifiedUsers(false);
        const rawUsers = (data?.verifiedUsers || []).filter((user) => !user.blocked);
        setUsers(rawUsers.map(normalizeUser));
      }
    } catch (error) {
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleToggleBlock = async (user) => {
    if (!user?.raw?.id) return;

    const action = user.status === "Blocked" ? "unblock" : "block";
    const confirmText = user.status === "Blocked"
      ? "Unblock this user?"
      : "Block this user?";

    if (typeof window !== "undefined" && !window.confirm(confirmText)) {
      return;
    }

    try {
      await adminService.updateUserBlockStatus(user.raw.id, action);
      await fetchStats();
      await fetchUsers();
    } catch (error) {
      // Swallow error for now; can be wired to toast later.
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const subscriptionData = [
    { name: "Mon", value: 500 },
    { name: "Tue", value: 150 },
    { name: "Wed", value: 450 },
    { name: "Thur", value: 100 },
    { name: "Fri", value: 750 },
  ];

  const analyticsData = [
    { name: "Jan", value: 250 },
    { name: "Mar", value: 650 },
    { name: "May", value: 200 },
    { name: "July", value: 600 },
    { name: "Sep", value: 850 },
  ];

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      [user.name, user.email, user.phone].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [users, searchQuery]);

  return (
    <div className={styles.dashboardOverview}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>All Users</h3>
          <p className={styles.statValue}>{userData.allUsers}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Approved Accounts</h3>
          <p className={styles.statValue}>{userData.approvedAccounts}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Blocked Accounts</h3>
          <p className={styles.statValue}>{userData.blockedAccounts}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Flagged Users</h3>
          <p className={styles.statValue}>{userData.flaggedUsers}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Subscription</h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={subscriptionData}>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  domain={[0, 800]}
                  ticks={[0, 200, 400, 600, 800]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Analytics- Real-time device usage
          </h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={analyticsData}>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  domain={[0, 900]}
                  ticks={[0, 250, 500, 750, 900]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>All Users</h3>
        </div>

        <div className={styles.tableTabs}>
          <div className={styles.tabsList}>
            {["All", "Approved", "Blocked", "Flagged"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${
                  activeTab === tab ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.searchContainer}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Last active</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.lastActive}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[user.status.toLowerCase()]
                      }`}
                    >
                      {user.status === 'Approved' && <CheckCircleIcon className={styles.statusIcon} />}
                      {user.status === 'Flagged' && <BlockIcon className={styles.statusIcon} />}
                      {user.status === 'Blocked' && <CancelIcon className={styles.statusIcon} />}
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${styles.actionBtn} ${
                        user.status === "Blocked" ? styles.unblockBtn : styles.blockBtn
                      }`}
                      onClick={() => handleToggleBlock(user)}
                      disabled={isLoadingUsers}
                    >
                      {user.status === "Blocked" ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoadingUsers && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
