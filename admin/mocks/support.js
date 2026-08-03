/**
 * Support mock data for admin oversight.
 * All data is development-only. Replace with real API when available.
 */

export const mockSupportStats = {
  open: 12,
  inProgress: 8,
  resolved: 145,
  escalated: 3,
  avgResponseTime: "4.2 hours",
};

export const mockSupportTickets = [
  { id: "tkt_1", subject: "Cannot pair new device", userName: "Amina Bello", email: "amina@email.com", category: "device", priority: "medium", status: "open", createdAt: "2026-07-31T14:00:00Z", lastReply: "2026-07-31T14:30:00Z", messages: 2 },
  { id: "tkt_2", subject: "SOS alert triggered accidentally", userName: "Chidi Adeyemi", email: "chidi@email.com", category: "alerts", priority: "high", status: "in_progress", createdAt: "2026-07-31T10:00:00Z", lastReply: "2026-07-31T11:15:00Z", messages: 4 },
  { id: "tkt_3", subject: "Subscription renewal issue", userName: "Nneka Okonkwo", email: "nneka@email.com", category: "billing", priority: "high", status: "open", createdAt: "2026-07-31T09:00:00Z", lastReply: "2026-07-31T09:00:00Z", messages: 1 },
  { id: "tkt_4", subject: "App crashes on start", userName: "Kofi Mensah", email: "kofi@email.com", category: "technical", priority: "medium", status: "in_progress", createdAt: "2026-07-30T16:00:00Z", lastReply: "2026-07-31T08:00:00Z", messages: 6 },
  { id: "tkt_5", subject: "Feature request: dark mode", userName: "Grace Bello", email: "grace@email.com", category: "feedback", priority: "low", status: "resolved", createdAt: "2026-07-29T12:00:00Z", lastReply: "2026-07-30T15:00:00Z", messages: 3 },
];

export const mockTicketDetail = {
  ...mockSupportTickets[0],
  userInfo: { id: "usr_1", name: "Amina Bello", email: "amina@email.com", phone: "+234-***-****", device: "iPhone 14, iOS 17.4" },
  messages: [
    { id: "msg_1", from: "user", content: "I've been trying to pair my child's new Android phone but the QR code doesn't scan. I've tried restarting both phones.", timestamp: "2026-07-31T14:00:00Z" },
    { id: "msg_2", from: "admin", author: "Support Admin", content: "Thank you for reaching out. Can you confirm the Sentinelr app version on your child's device?", timestamp: "2026-07-31T14:30:00Z" },
  ],
  internalNotes: [],
};

export const mockFeedbackItems = [
  { id: "fb_1", userName: "Amina Bello", rating: 4, comment: "Great app, pairing could be smoother", category: "ux", createdAt: "2026-07-28T10:00:00Z" },
  { id: "fb_2", userName: "Kofi Mensah", rating: 5, comment: "Peace of mind knowing where my kids are", category: "general", createdAt: "2026-07-27T15:00:00Z" },
  { id: "fb_3", userName: "Nneka Okonkwo", rating: 3, comment: "Subscription pricing is confusing", category: "billing", createdAt: "2026-07-26T09:00:00Z" },
];
