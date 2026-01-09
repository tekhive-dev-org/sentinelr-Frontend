import Image from 'next/image';
import styles from './UserSubscription.module.css';
import { getPlanPrice, getPlanPeriod } from './utils';

export default function PlanCard({ plan, billingCycle, onSelect }) {
  return (
    <div className={`${styles.planCard} ${plan.featured ? styles.featured : ''}`}>
      <h3 className={styles.planTitle}>{plan.name}</h3>
      <p className={styles.planDesc}>{plan.desc}</p>
      <div className={styles.planPrice}>
        {getPlanPrice(plan, billingCycle)}<span>{getPlanPeriod(plan, billingCycle)}</span>
      </div>
      <button 
        className={`${styles.selectPlanBtn} ${styles[plan.type]}`}
        onClick={() => onSelect(plan)}
      >
        {plan.btnText}
      </button>
      <p className={styles.includesLabel}>Includes:</p>
      <ul className={styles.featuresList}>
        {plan.features.map((feature, idx) => (
          <li key={idx} className={styles.featureItem}>
            <Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
