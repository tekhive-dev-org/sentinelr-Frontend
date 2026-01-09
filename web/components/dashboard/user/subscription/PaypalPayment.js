import { CircularProgress } from '@mui/material';
import styles from './UserSubscription.module.css';

export default function PaypalPayment({ isProcessing, totalAmount, onSubmit }) {
  return (
    <div className={styles.methodDetails}>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
        You will be redirected to PayPal to complete your payment securely.
      </p>
      <button 
        className={styles.payButton} 
        onClick={onSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <><CircularProgress size={20} color="inherit" /> Redirecting...</>
        ) : (
          `Continue to PayPal - $${totalAmount.toFixed(2)}`
        )}
      </button>
    </div>
  );
}
