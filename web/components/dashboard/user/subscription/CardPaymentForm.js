import { CircularProgress } from '@mui/material';
import styles from './UserSubscription.module.css';
import { formatCardNumber, formatExpiry } from './utils';

export default function CardPaymentForm({ 
  cardDetails, 
  errors, 
  isProcessing, 
  totalAmount,
  onInputChange, 
  onSubmit 
}) {
  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    onInputChange(field, formattedValue);
  };

  return (
    <div className={styles.methodDetails}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Card Holders Name</label>
        <input 
          type="text" 
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Enter cardholder name"
          value={cardDetails.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isProcessing}
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Card Number</label>
        <input 
          type="text" 
          className={`${styles.input} ${errors.number ? styles.inputError : ''}`}
          placeholder="0000 0000 0000 0000"
          value={cardDetails.number}
          onChange={(e) => handleChange('number', e.target.value)}
          maxLength={19}
          disabled={isProcessing}
        />
        {errors.number && <span className={styles.errorText}>{errors.number}</span>}
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Expiry Date</label>
          <input 
            type="text" 
            className={`${styles.input} ${errors.expiry ? styles.inputError : ''}`}
            placeholder="MM/YY"
            value={cardDetails.expiry}
            onChange={(e) => handleChange('expiry', e.target.value)}
            maxLength={5}
            disabled={isProcessing}
          />
          {errors.expiry && <span className={styles.errorText}>{errors.expiry}</span>}
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label className={styles.label}>CVV</label>
          <input 
            type="password" 
            className={`${styles.input} ${errors.cvv ? styles.inputError : ''}`}
            placeholder="***"
            value={cardDetails.cvv}
            onChange={(e) => handleChange('cvv', e.target.value)}
            maxLength={4}
            disabled={isProcessing}
          />
          {errors.cvv && <span className={styles.errorText}>{errors.cvv}</span>}
        </div>
      </div>
      <button 
        className={styles.payButton} 
        onClick={onSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <><CircularProgress size={20} color="inherit" /> Processing...</>
        ) : (
          `Pay $${totalAmount.toFixed(2)}`
        )}
      </button>
    </div>
  );
}
