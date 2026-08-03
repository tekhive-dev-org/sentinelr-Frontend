import SectionCard from './SectionCard';
import GroupsIcon from '@mui/icons-material/Groups';
import styles from './UserDetailFamily.module.css';

export default function UserDetailFamily({ families, isLoading }) {
  const isEmpty = !families || families.length === 0;

  return (
    <SectionCard
      title="Family Memberships"
      icon={GroupsIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No family memberships"
    >
      {!isEmpty && (
        <ul className={styles.list}>
          {families.map((family) => (
            <li key={family.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <span className={styles.familyName}>{family.name}</span>
                <span className={styles.meta}>
                  {family.memberCount != null && (
                    <span>{family.memberCount} member{family.memberCount !== 1 ? 's' : ''}</span>
                  )}
                  {family.relationship && (
                    <span className={styles.relationship}>
                      &middot; {family.relationship}
                    </span>
                  )}
                </span>
              </div>
              <button type="button" className={styles.viewLink} tabIndex={0}>
                View
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
