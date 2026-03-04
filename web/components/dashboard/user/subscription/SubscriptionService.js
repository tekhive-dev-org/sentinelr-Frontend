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
      desc: 'Perfect for trying Sentinelr\'s core security features.',
      monthlyPrice: 0,
      annualPrice: 0,
      displayMonthlyPrice: '$FREE',
      displayAnnualPrice: '$FREE',
      period: '',
      btnText: 'Get Started',
      type: 'outline',
      features: ['Full Security Monitoring', 'Monitor Up To 2 Devices', 'Real-Time Intruder Alerts & History']
      },
      {
      id: 'personal',
      name: 'Personal Plan',
      desc: 'Ideal for individuals needing comprehensive device protection.',
      monthlyPrice: 15,
      annualPrice: 100,
      displayMonthlyPrice: '$15',
      displayAnnualPrice: '$100',
      monthlyPeriod: '/month',
      annualPeriod: '/year',
      btnText: 'Get Started',
      type: 'filled',
      featured: true,
      features: ['Full Security Monitoring', 'Monitor Up To 4 Devices', 'Advanced Threat Detection', 'Priority Support']
      },
      {
      id: 'family',
      name: 'Family Plan',
      desc: 'Protect your entire family with unlimited devices and premium support.',
      monthlyPrice: null,
      annualPrice: null,
      displayMonthlyPrice: 'Custom',
      displayAnnualPrice: 'Custom',
      period: ' pricing',
      btnText: 'Contact Us',
      type: 'outline',
      features: ['Full Security Monitoring', 'Unlimited Device Protection', 'Advanced Threat Detection & Analysis', '24/7 Priority Support']
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
