export const DEMO_USERS = Object.freeze([
  {
    id: "usr-1001",
    userName: "Amara Johnson",
    email: "amara.johnson@example.com",
    phone: "+1 415 555 0142",
    role: "Parent",
    verified: true,
    blocked: false,
    createdAt: "2026-07-28T09:24:00.000Z",
    updatedAt: "2026-07-31T10:42:00.000Z",
  },
  {
    id: "usr-1002",
    userName: "Noah Williams",
    email: "noah.williams@example.com",
    phone: "+1 212 555 0188",
    role: "Child",
    verified: true,
    blocked: false,
    createdAt: "2026-07-27T14:10:00.000Z",
    updatedAt: "2026-07-31T09:16:00.000Z",
  },
  {
    id: "usr-1003",
    userName: "Sophia Martinez",
    email: "sophia.martinez@example.com",
    phone: "+1 305 555 0116",
    role: "Parent",
    verified: false,
    blocked: false,
    createdAt: "2026-07-26T11:48:00.000Z",
    updatedAt: "2026-07-30T18:30:00.000Z",
  },
  {
    id: "usr-1004",
    userName: "Ethan Brown",
    email: "ethan.brown@example.com",
    phone: "+1 206 555 0175",
    role: "Parent",
    verified: true,
    blocked: true,
    createdAt: "2026-07-23T08:05:00.000Z",
    updatedAt: "2026-07-29T12:02:00.000Z",
  },
  {
    id: "usr-1005",
    userName: "Mia Davis",
    email: "mia.davis@example.com",
    phone: "+1 312 555 0193",
    role: "Child",
    verified: true,
    blocked: false,
    createdAt: "2026-07-21T16:36:00.000Z",
    updatedAt: "2026-07-31T08:54:00.000Z",
  },
  {
    id: "usr-1006",
    userName: "Liam Wilson",
    email: "liam.wilson@example.com",
    phone: "+1 617 555 0129",
    role: "Parent",
    verified: true,
    blocked: false,
    suspended: true,
    status: "suspended",
    createdAt: "2026-07-19T10:22:00.000Z",
    updatedAt: "2026-07-28T19:44:00.000Z",
  },
  {
    id: "usr-1007",
    userName: "Olivia Taylor",
    email: "olivia.taylor@example.com",
    phone: "+1 404 555 0164",
    role: "Parent",
    verified: true,
    blocked: false,
    createdAt: "2026-07-18T07:18:00.000Z",
    updatedAt: "2026-07-31T07:31:00.000Z",
  },
  {
    id: "usr-1008",
    userName: "Lucas Anderson",
    email: "lucas.anderson@example.com",
    phone: "+1 713 555 0157",
    role: "Child",
    verified: false,
    blocked: false,
    createdAt: "2026-07-16T13:52:00.000Z",
    updatedAt: "2026-07-27T15:08:00.000Z",
  },
]);

export function getDemoUsers(params = {}) {
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.max(Number(params.limit) || 20, 1);
  const search = String(params.search || "").trim().toLowerCase();
  const role = String(params.role || "").toLowerCase();
  const verified = String(params.verified || "").toLowerCase();
  const status = String(params.blocked || "").toLowerCase();

  let users = [...DEMO_USERS];

  if (search) {
    users = users.filter((user) =>
      [user.userName, user.email, user.phone].some((value) =>
        String(value || "").toLowerCase().includes(search),
      ),
    );
  }

  if (role && role !== "all") {
    users = users.filter((user) => user.role.toLowerCase() === role);
  }

  if (verified === "verified" || verified === "true") {
    users = users.filter((user) => user.verified);
  } else if (verified === "unverified" || verified === "false") {
    users = users.filter((user) => !user.verified);
  }

  if (status === "active") {
    users = users.filter((user) => user.verified && !user.blocked && !user.suspended);
  } else if (status === "blocked" || status === "true") {
    users = users.filter((user) => user.blocked);
  } else if (status === "suspended") {
    users = users.filter((user) => user.suspended);
  }

  const total = users.length;
  const start = (page - 1) * limit;

  return {
    users: users.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}
