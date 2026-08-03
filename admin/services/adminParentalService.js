// MOCK-POWERED — Replace with real API when available
import { mockParentalStats, mockParentalFamilies, mockParentalActivity } from "../mocks/parental";

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const adminParentalService = {
  async getFamilies(params = {}) {
    await delay(400);
    let families = [...mockParentalFamilies];
    if (params.search) { const q = params.search.toLowerCase(); families = families.filter(f => f.familyName.toLowerCase().includes(q)); }
    if (params.monitoring !== undefined) families = families.filter(f => f.monitoringActive === (params.monitoring === "true"));
    const page = params.page || 1; const limit = params.limit || 20;
    return { families: families.slice((page - 1) * limit, page * limit), total: families.length, totalPages: Math.ceil(families.length / limit) };
  },
  async getStats() { await delay(300); return mockParentalStats; },
  async getFamilyDetail(id) { await delay(300); return mockParentalFamilies.find(f => f.id === id) || mockParentalFamilies[0]; },
  async getActivity(params = {}) { await delay(300); return { activities: mockParentalActivity.slice(0, params.limit || 20), total: mockParentalActivity.length }; },
};
