import SectionCard from '../users/SectionCard';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import styles from './SubscriptionPaymentHistory.module.css';

const STATUS_STYLE = {
  success: styles.statusSuccess,
  failed: styles.statusFailed,
  refunded: styles.statusRefunded,
};

const ROW_STYLE = {
  failed: styles.rowFailed,
  refunded: styles.rowRefunded,
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatAmount(amount, currency) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Masks provider reference to never display full card numbers.
 * Shows only last4 if available: "•••• 4242"
 */
function maskProviderRef(payment) {
  const ref = payment?.providerRef || payment?.providerReference;
  if (!ref) return '—';

  if (payment.last4) {
    return `•••• ${payment.last4}`;
  }

  // If reference looks like a card number (13-19 digits), mask it
  const digitsOnly = ref.replace(/\D/g, '');
  if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
    return `•••• ${digitsOnly.slice(-4)}`;
  }

  // Otherwise truncate to 12 chars for safety
  return ref.length > 12 ? `•••${ref.slice(-8)}` : ref;
}

export default function SubscriptionPaymentHistory({ payments, isLoading }) {
  const isEmpty = !payments || !Array.isArray(payments) || payments.length === 0;

  return (
    <SectionCard
      title="Payment History"
      icon={PaymentsOutlinedIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No payment history recorded"
    >
      {!isEmpty && (
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Provider Ref</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => {
                const status = payment.status?.toLowerCase();
                const rowClass = ROW_STYLE[status] || '';
                const pillClass = STATUS_STYLE[status] || '';

                return (
                  <tr key={payment.id || idx} className={rowClass}>
                    <td>{formatDate(payment.date || payment.createdAt)}</td>
                    <td>{formatAmount(payment.amount, payment.currency)}</td>
                    <td>{(payment.currency || 'USD').toUpperCase()}</td>
                    <td>
                      <span className={`${styles.statusPill} ${pillClass}`}>
                        {payment.status || 'unknown'}
                      </span>
                      {payment.failureReason && status === 'failed' && (
                        <span className={styles.failureReason}>
                          {payment.failureReason}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={styles.providerRef}>
                        {maskProviderRef(payment)}
                      </span>
                    </td>
                    <td>
                      {payment.invoiceId && (
                        <a
                          href={`/dashboard/invoices/${payment.invoiceId}`}
                          className={styles.invoiceLink}
                        >
                          <DownloadOutlinedIcon
                            className="text-sm"
                            aria-hidden="true"
                          />
                          Invoice
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
