import Image from 'next/image';
import { CheckCircleOutline as CheckIcon } from '@mui/icons-material';
import styles from './UserSubscription.module.css';

export default function PaymentMethodOption({ 
  method, 
  icon, 
  name, 
  isSelected, 
  isDetailsOpen, 
  onSelect, 
  children 
}) {
  return (
    <div className={`${styles.methodOption} ${isSelected && isDetailsOpen ? styles.methodOptionActive : ''}`}>
      <div className={styles.methodSummary} onClick={() => !isDetailsOpen && onSelect(method)}>
        <div className={styles.methodLeft}>
          {isDetailsOpen && isSelected ? (
            <span className={styles.methodCheckIcon}>
              <CheckIcon />
            </span>
          ) : (
            <div className={`${styles.radio} ${isSelected ? styles.selected : ''}`}></div>
          )}
          <span className={styles.methodIconWrap}>
            <Image src={icon} alt={name} width={24} height={24} />
          </span>
          <span className={styles.methodName}>{name}</span>
        </div>
      </div>
      {isDetailsOpen && isSelected && children}
    </div>
  );
}
