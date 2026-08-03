import { useState } from 'react';
import SectionCard from '../users/SectionCard';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import styles from './SubscriptionInvoices.module.css';

const STATUS_STYLE = {
  paid: styles.statusPaid,
  open: styles.statusOpen,
  void: styles.statusVoid,
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

export default function SubscriptionInvoices({ invoices, isLoading, onDownload, onResend }) {
  const [resendingId, setResendingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const isEmpty = !invoices || !Array.isArray(invoices) || invoices.length === 0;

  const handleDownload = async (invoice) => {
    if (!onDownload) return;
    setDownloadingId(invoice.id);
    try {
      await onDownload(invoice.id);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResend = async (invoice) => {
    if (!onResend) return;
    setResendingId(invoice.id);
    try {
      await onResend(invoice.id);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <SectionCard
      title="Invoices"
      icon={DescriptionOutlinedIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No invoices available"
    >
      {!isEmpty && (
        <div className={styles.list}>
          {invoices.map((invoice, idx) => {
            const status = invoice.status?.toLowerCase();
            const pillClass = STATUS_STYLE[status] || '';

            return (
              <div key={invoice.id || idx} className={styles.item}>
                <div className={styles.itemLeft}>
                  <span className={styles.invoiceNumber}>
                    {invoice.number || `Invoice #${invoice.id || idx + 1}`}
                  </span>
                  <div className={styles.itemMeta}>
                    <span>{formatDate(invoice.date || invoice.createdAt)}</span>
                    <span
                      className={`${styles.statusPill} ${pillClass}`}
                    >
                      {invoice.status || 'unknown'}
                    </span>
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <span className={styles.amount}>
                    {formatAmount(invoice.amount, invoice.currency)}
                  </span>

                  {onDownload && (
                    <Tooltip title="Download invoice PDF" arrow>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                        aria-label={`Download invoice ${invoice.number || invoice.id}`}
                      >
                        {downloadingId === invoice.id ? (
                          <CircularProgress size={14} aria-hidden="true" />
                        ) : (
                          <DownloadOutlinedIcon className="text-sm" aria-hidden="true" />
                        )}
                        <span>Download</span>
                      </button>
                    </Tooltip>
                  )}

                  {onResend && (
                    <Tooltip title="Resend invoice via email" arrow>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.resendBtn}`}
                        onClick={() => handleResend(invoice)}
                        disabled={resendingId === invoice.id}
                        aria-label={`Resend invoice ${invoice.number || invoice.id}`}
                      >
                        {resendingId === invoice.id ? (
                          <CircularProgress size={14} aria-hidden="true" />
                        ) : (
                          <SendOutlinedIcon className="text-sm" aria-hidden="true" />
                        )}
                        <span>Resend</span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
