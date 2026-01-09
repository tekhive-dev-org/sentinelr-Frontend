// ============================================
// SUBSCRIPTION SERVICE - API Ready Structure
// ============================================
const SERVICE_CHARGE = 1.00;

const SubscriptionService = {
  SERVICE_CHARGE,
  
  // Replace these with actual API calls
  async getPlans() {
    // TODO: Replace with actual API call
    // return await fetch('/api/subscription/plans').then(res => res.json());
    return [
      {
        id: 'free',
        name: 'Freemium Plan',
        desc: 'Best for individuals testing their first plan.',
        monthlyPrice: 0,
        annualPrice: 0,
        displayMonthlyPrice: '$FREE',
        displayAnnualPrice: '$FREE',
        period: '',
        btnText: 'Get Started',
        type: 'outline',
        features: ['Full Security', 'Limited to just on device', 'Including intruder alerts & history']
      },
      {
        id: 'personal',
        name: 'Personal Plan',
        desc: 'Best for group of individuals testing their first mentorship booking.',
        monthlyPrice: 25,
        annualPrice: 250,
        displayMonthlyPrice: '$10-25',
        displayAnnualPrice: '$100-250',
        monthlyPeriod: '/month',
        annualPeriod: '/year',
        btnText: 'Get Started',
        type: 'filled',
        featured: true,
        features: ['Full Security', 'Connect Up To 2 Devices', 'Tasks After a Session', 'Access To Prebuilt Templates']
      },
      {
        id: 'family',
        name: 'Family Plan',
        desc: 'Best for individuals testing their first mentorship booking.',
        monthlyPrice: null,
        annualPrice: null,
        displayMonthlyPrice: 'Custom',
        displayAnnualPrice: 'Custom',
        period: ' pricing',
        btnText: 'Contact Us',
        type: 'outline',
        features: ['Full Security', 'Connect More Than 5 Devices', 'Including Intruder Alerts & History', 'Priority Email Support']
      }
    ];
  },

  async processCardPayment(cardDetails, plan, billingCycle) {
    // TODO: Replace with actual payment gateway integration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({ success: true, transactionId: 'TXN_' + Date.now() });
        } else {
          reject(new Error('Payment failed. Please try again.'));
        }
      }, 2000);
    });
  },

  async generateBankTransferDetails(plan, billingCycle) {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          bankName: 'Moniepoint Microfinance Bank',
          accountNumber: '8160232043',
          amount: billingCycle === 'annual' ? 'NGN 396,000' : 'NGN 49,600',
          expiresAt: new Date(Date.now() + 39 * 60 * 1000)
        });
      }, 500);
    });
  },

  async verifyBankTransfer(accountNumber, amount) {
    // TODO: Replace with actual verification API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Payment verified successfully!' });
      }, 2000);
    });
  },

  async initiatePaypalPayment(plan, billingCycle) {
    // TODO: Replace with PayPal SDK
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ redirectUrl: 'https://paypal.com/checkout/...' });
      }, 1000);
    });
  }
};

export default SubscriptionService;
