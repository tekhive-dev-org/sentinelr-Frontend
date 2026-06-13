import styles from './UserSubscription.module.css';
import { ButtonLoader } from '../../../ui/loaders';

export default function PaypalPayment({ isProcessing, totalAmount, onSubmit }) {
  return (
    <div className={styles.methodDetails}>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
        You will be redirected to PayPal to complete your payment securely.
      </p>
      <ButtonLoader 
        className={styles.payButton} 
        onClick={onSubmit}
        loading={isProcessing}
      >
        {`Continue to PayPal - $${totalAmount.toFixed(2)}`}
      </ButtonLoader>
    </div>
  );
}
