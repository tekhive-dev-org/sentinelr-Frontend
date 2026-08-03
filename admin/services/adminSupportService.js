// MOCK-POWERED — Replace with real API when available
import { mockSupportStats, mockSupportTickets, mockTicketDetail, mockFeedbackItems } from "../mocks/support";

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const adminSupportService = {
  async getTickets(params = {}) {
    await delay(400);
    let tickets = [...mockSupportTickets];
    if (params.search) { const q = params.search.toLowerCase(); tickets = tickets.filter(t => t.subject.toLowerCase().includes(q) || t.userName.toLowerCase().includes(q)); }
    if (params.status) tickets = tickets.filter(t => t.status === params.status);
    if (params.category) tickets = tickets.filter(t => t.category === params.category);
    if (params.priority) tickets = tickets.filter(t => t.priority === params.priority);
    const page = params.page || 1; const limit = params.limit || 20;
    return { tickets: tickets.slice((page - 1) * limit, page * limit), total: tickets.length, totalPages: Math.ceil(tickets.length / limit) };
  },
  async getStats() { await delay(300); return mockSupportStats; },
  async getTicketDetail(id) { await delay(300); return mockTicketDetail; },
  async getFeedback(params = {}) { await delay(300); return { feedback: mockFeedbackItems.slice(0, params.limit || 20), total: mockFeedbackItems.length }; },
};
