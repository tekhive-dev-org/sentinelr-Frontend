import { CircularProgress } from '@mui/material';
import styles from './UserSubscription.module.css';
import PlanCard from './PlanCard';

export default function PlanSelection({ 
  plans, 
  plansLoading, 
  billingCycle, 
  onBillingCycleChange, 
  onPlanSelect 
}) {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.pricingBadgeContainer}>
          <span className={styles.pricingBadge}>Our pricing</span>
        </div>
        <h2 className={styles.title}>Designed without limits..</h2>
        <p className={styles.subtitle}>Try our freemium plan for 14 days. Cancel or upgrade anytime.</p>
        
        <div className={styles.toggleContainer}>
          <div className={styles.toggleWrapper}>
            <button 
              className={`${styles.toggleOption} ${billingCycle === 'annual' ? styles.active : ''}`}
              onClick={() => onBillingCycleChange('annual')}
            >
              Annual
            </button>
            <button 
              className={`${styles.toggleOption} ${billingCycle === 'monthly' ? styles.active : ''}`}
              onClick={() => onBillingCycleChange('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {plansLoading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress />
          <p>Loading plans...</p>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              onSelect={onPlanSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}
