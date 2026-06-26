import styles from './UserSubscription.module.css';
import PlanCard from './PlanCard';
import { CardSkeleton } from '../../../ui/loaders';

export default function PlanSelection({ 
  plans, 
  plansLoading, 
  billingCycle, 
  onBillingCycleChange, 
  onPlanSelect 
}) {
  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.pricingBadge}>Subscription Plans</span>
          <h1 className={styles.title}>Protection that scales with your household</h1>
          <p className={styles.subtitle}>Choose a Sentinelr plan, compare coverage, and move into payment when you are ready.</p>
        </div>

        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>Billing</span>
          <div className={styles.toggleWrapper}>
            <button 
              type="button"
              className={`${styles.toggleOption} ${billingCycle === 'annual' ? styles.active : ''}`}
              onClick={() => onBillingCycleChange('annual')}
            >
              Annual
              <small>Best value</small>
            </button>
            <button 
              type="button"
              className={`${styles.toggleOption} ${billingCycle === 'monthly' ? styles.active : ''}`}
              onClick={() => onBillingCycleChange('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {plansLoading ? (
        <CardSkeleton variant="stat" count={3} className={styles.plansGrid} />
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
