import { useState } from 'react';
import SectionCard from '../users/SectionCard';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import styles from './AlertContacts.module.css';

function maskPhone(phone) {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return `****${cleaned.slice(-4)}`;
}

export default function AlertContacts({ alert, isLoading }) {
  const [showPhone, setShowPhone] = useState(false);
  const contacts = alert?.emergencyContacts;
  const isEmpty = !contacts || contacts.length === 0;

  return (
    <SectionCard
      title="Emergency Contacts"
      icon={ContactPhoneIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No emergency contacts on file"
    >
      <div className={styles.content}>
        <ul className={styles.contactList}>
          {contacts.map((contact) => (
            <li key={contact.id} className={styles.contactRow}>
              <span className={styles.contactName}>
                {contact.name || '—'}
              </span>
              {contact.relationship && (
                <span className={styles.contactRelation}>
                  {contact.relationship}
                </span>
              )}
              {showPhone ? (
                <span className={styles.contactPhone}>
                  {contact.phone || '—'}
                </span>
              ) : (
                <span className={styles.phonePlaceholder}>
                  {maskPhone(contact.phone)}
                </span>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowPhone((prev) => !prev)}
        >
          {showPhone ? 'Hide contact' : 'Show contact'}
        </button>

        <p className={styles.disclaimer}>Contact details are confidential</p>
      </div>
    </SectionCard>
  );
}
