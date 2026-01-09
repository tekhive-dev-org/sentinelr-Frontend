// Card validation and formatting utilities
export const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : value;
};

export const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

export const validateCardNumber = (number) => {
  const cleaned = number.replace(/\s/g, '');
  return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
};

export const validateExpiry = (expiry) => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return month >= 1 && month <= 12 && (year > currentYear || (year === currentYear && month >= currentMonth));
};

export const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Pricing utilities
export const getPlanPrice = (plan, billingCycle) => {
  return billingCycle === 'annual' ? plan.displayAnnualPrice : plan.displayMonthlyPrice;
};

export const getPlanPeriod = (plan, billingCycle) => {
  if (plan.period !== undefined) return plan.period;
  return billingCycle === 'annual' ? plan.annualPeriod : plan.monthlyPeriod;
};

export const getNumericPrice = (plan) => {
  if (!plan) return 0;
  const price = plan.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  return price || 0;
};

// Clipboard utility
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};
