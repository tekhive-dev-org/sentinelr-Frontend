import { ContentCopy as ContentCopyIcon, Info as InfoIcon } from '@mui/icons-material';
import styles from './UserSubscription.module.css';
import { CardSkeleton, ButtonLoader } from '../../../ui/loaders';

export default function BankTransferForm({ 
  bankDetails, 
  countdown, 
  isProcessing, 
  onCopy, 
  onConfirm 
}) {
  if (!bankDetails) {
    return (
      <div className={styles.methodDetails}>
        <CardSkeleton variant="info" count={1} />
      </div>
    );
  }

  const isExpired = countdown === 'Expired';

  return (
    <div className={styles.methodDetails}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Bank Name</label>
        <div className={styles.copyField}>
          <span>{bankDetails.bankName}</span>
          <span className={styles.bankInitial}>M</span>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Account Number</label>
        <div 
          className={`${styles.copyField} ${styles.copyFieldButton}`}
          onClick={() => onCopy(bankDetails.accountNumber, 'Account number')}
        >
          <b>{bankDetails.accountNumber}</b>
          <ContentCopyIcon className={styles.copyIcon} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Transfer Amount</label>
        <div 
          className={`${styles.copyField} ${styles.copyFieldButton}`}
          onClick={() => onCopy(bankDetails.amount.replace(/[^0-9]/g, ''), 'Amount')}
        >
          <b>{bankDetails.amount}</b>
          <ContentCopyIcon className={styles.copyIcon} />
        </div>
      </div>
      
      <div className={styles.warningBox}>
        <InfoIcon className={styles.warningIcon} />
        <div>
          <p>Ensure you send the exact amount indicated</p>
          <p>This account would expire in <strong className={isExpired ? styles.expired : ''}>{countdown || '...'}</strong> do not save for future use.</p>
        </div>
      </div>
      
      <ButtonLoader 
        className={styles.payButton} 
        onClick={onConfirm}
        loading={isProcessing}
        disabled={isExpired}
      >
        {isExpired ? 'Session Expired - Go Back' : `I have sent ${bankDetails.amount}`}
      </ButtonLoader>
    </div>
  );
}
