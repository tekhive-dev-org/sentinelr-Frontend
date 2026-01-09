import { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import styles from './UserSubscription.module.css';

// Import sub-components
import SubscriptionService from './SubscriptionService';
import PlanSelection from './PlanSelection';
import PaymentMethodOption from './PaymentMethodOption';
import CardPaymentForm from './CardPaymentForm';
import BankTransferForm from './BankTransferForm';
import PaypalPayment from './PaypalPayment';
import PricingSummary from './PricingSummary';
import { 
  validateCardNumber, 
  validateExpiry, 
  validateCVV, 
  getNumericPrice,
  copyToClipboard 
} from './utils';

export default function UserSubscription() {
  // Core State
  const [step, setStep] = useState(1);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  
  // Plans Data
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // Payment State
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  
  // Bank Transfer State
  const [bankDetails, setBankDetails] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  // Feedback State
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Load plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await SubscriptionService.getPlans();
        setPlans(data);
      } catch (error) {
        showSnackbar('Failed to load plans. Please refresh.', 'error');
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, []);

  // Countdown timer for bank transfer
  useEffect(() => {
    if (!bankDetails?.expiresAt) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = bankDetails.expiresAt - now;
      if (diff <= 0) {
        setCountdown('Expired');
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [bankDetails?.expiresAt]);

  // Helpers
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTotalAmount = () => {
    const planPrice = getNumericPrice(selectedPlan);
    return planPrice + SubscriptionService.SERVICE_CHARGE;
  };

  // Handlers
  const handlePlanSelect = (plan) => {
    if (plan.id === 'family') {
      showSnackbar('Please contact us for custom pricing.', 'info');
      return;
    }
    setSelectedPlan({ ...plan, billingCycle });
    setStep(2);
    setIsPaymentDetailsOpen(false);
    setErrors({});
  };

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCardForm = () => {
    const newErrors = {};
    if (!cardDetails.name.trim()) newErrors.name = 'Cardholder name is required';
    if (!validateCardNumber(cardDetails.number)) newErrors.number = 'Invalid card number';
    if (!validateExpiry(cardDetails.expiry)) newErrors.expiry = 'Invalid expiry date';
    if (!validateCVV(cardDetails.cvv)) newErrors.cvv = 'Invalid CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardPayment = async () => {
    if (!validateCardForm()) {
      showSnackbar('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await SubscriptionService.processCardPayment(
        cardDetails, selectedPlan, selectedPlan.billingCycle
      );
      showSnackbar(`Payment successful! Transaction ID: ${result.transactionId}`, 'success');
    } catch (error) {
      showSnackbar(error.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakePayment = async () => {
    setIsPaymentDetailsOpen(true);
    
    if (paymentMethod === 'phone') {
      try {
        const details = await SubscriptionService.generateBankTransferDetails(
          selectedPlan, selectedPlan.billingCycle
        );
        setBankDetails(details);
      } catch (error) {
        showSnackbar('Failed to generate transfer details', 'error');
      }
    }
  };

  const handleBankTransferConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await SubscriptionService.verifyBankTransfer(
        bankDetails.accountNumber, bankDetails.amount
      );
      showSnackbar(result.message, 'success');
    } catch (error) {
      showSnackbar('Verification failed. Please wait and try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaypalPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await SubscriptionService.initiatePaypalPayment(
        selectedPlan, selectedPlan.billingCycle
      );
      window.location.href = result.redirectUrl;
    } catch (error) {
      showSnackbar('Failed to initiate PayPal payment', 'error');
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = async (text, label) => {
    const success = await copyToClipboard(text);
    showSnackbar(success ? `${label} copied to clipboard!` : 'Failed to copy', success ? 'success' : 'error');
  };

  const handleBackNavigation = () => {
    if (isPaymentDetailsOpen) {
      setIsPaymentDetailsOpen(false);
      setBankDetails(null);
    } else {
      setStep(1);
      setSelectedPlan(null);
    }
  };

  // Payment Selection Component
  const PaymentSelectionView = () => (
    <>
      <div className={styles.methodHeader}>
        <div className={styles.headerNav}>
          <button className={styles.backButton} onClick={handleBackNavigation}>
            ← {isPaymentDetailsOpen ? 'Back to payment methods' : 'Back to plans'}
          </button>
        </div>
        <h3 className={styles.methodTitle}>Payment Method</h3>
        <p className={styles.methodSubtitle}>
          Kindly {isPaymentDetailsOpen ? 'input the correct data' : 'select the payment option'} to complete your payment.
        </p>
      </div>

      <div className={styles.paymentContainer}>
        <div className={styles.paymentMethods}>
          {/* Credit/Debit Card */}
          {(!isPaymentDetailsOpen || paymentMethod === 'card') && (
            <PaymentMethodOption
              method="card"
              icon="/assets/icons/Mastercard.png"
              name="Credit Or Debit Card"
              isSelected={paymentMethod === 'card'}
              isDetailsOpen={isPaymentDetailsOpen}
              onSelect={setPaymentMethod}
            >
              <CardPaymentForm
                cardDetails={cardDetails}
                errors={errors}
                isProcessing={isProcessing}
                totalAmount={getTotalAmount()}
                onInputChange={handleCardInputChange}
                onSubmit={handleCardPayment}
              />
            </PaymentMethodOption>
          )}

          {/* Phone Transfer */}
          {(!isPaymentDetailsOpen || paymentMethod === 'phone') && (
            <PaymentMethodOption
              method="phone"
              icon="/assets/icons/MobilePhone.png"
              name="Phone Transfer"
              isSelected={paymentMethod === 'phone'}
              isDetailsOpen={isPaymentDetailsOpen}
              onSelect={setPaymentMethod}
            >
              <BankTransferForm
                bankDetails={bankDetails}
                countdown={countdown}
                isProcessing={isProcessing}
                onCopy={handleCopyToClipboard}
                onConfirm={handleBankTransferConfirm}
              />
            </PaymentMethodOption>
          )}

          {/* PayPal */}
          {(!isPaymentDetailsOpen || paymentMethod === 'paypal') && (
            <PaymentMethodOption
              method="paypal"
              icon="/assets/icons/Paypal.png"
              name="Paypal"
              isSelected={paymentMethod === 'paypal'}
              isDetailsOpen={isPaymentDetailsOpen}
              onSelect={setPaymentMethod}
            >
              <PaypalPayment
                isProcessing={isProcessing}
                totalAmount={getTotalAmount()}
                onSubmit={handlePaypalPayment}
              />
            </PaymentMethodOption>
          )}
        </div>

        <PricingSummary
          selectedPlan={selectedPlan}
          serviceCharge={SubscriptionService.SERVICE_CHARGE}
          showMakePayment={!isPaymentDetailsOpen}
          onMakePayment={handleMakePayment}
        />
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      {step === 1 ? (
        <PlanSelection
          plans={plans}
          plansLoading={plansLoading}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          onPlanSelect={handlePlanSelect}
        />
      ) : (
        <PaymentSelectionView />
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
