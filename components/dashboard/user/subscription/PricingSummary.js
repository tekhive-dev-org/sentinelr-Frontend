import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import styles from './UserSubscription.module.css';
import { getNumericPrice } from './utils';

export default function PricingSummary({ 
  selectedPlan, 
  serviceCharge, 
  showMakePayment, 
  onMakePayment 
}) {
  const planPrice = getNumericPrice(selectedPlan);
  const totalAmount = planPrice + serviceCharge;

  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryHeader}>
        <CreditCardIcon /> Pricing Plan Summary
      </div>
      <div className={styles.summaryRow}>
        <span>{selectedPlan?.name || 'Selected Plan'}</span>
        <b>${planPrice.toFixed(2)}</b>
      </div>
      <div className={styles.summaryRow}>
        <span>Service Charge</span>
        <b>${serviceCharge.toFixed(2)}</b>
      </div>
      <div className={styles.summaryTotal}>
        <span>Total Amount</span>
        <span>${totalAmount.toFixed(2)}</span>
      </div>
      
      {showMakePayment && (
        <button className={styles.payButtonSmall} onClick={onMakePayment}>
          Make Payment
        </button>
      )}
    </div>
  );
}
