import { useCallback } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './UsersPagination.module.css';

export default function UsersPagination({ page, totalPages, onPageChange }) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalPages === 0;

  const handlePrevious = useCallback(() => {
    if (!isFirstPage) {
      onPageChange(page - 1);
    }
  }, [page, isFirstPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (!isLastPage) {
      onPageChange(page + 1);
    }
  }, [page, isLastPage, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Users pagination">
      <button
        type="button"
        className={styles.pageBtn}
        onClick={handlePrevious}
        disabled={isFirstPage}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className={styles.pageIcon} />
        Previous
      </button>

      <span className={styles.pageInfo}>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        type="button"
        className={styles.pageBtn}
        onClick={handleNext}
        disabled={isLastPage}
        aria-label="Next page"
      >
        Next
        <ChevronRightIcon className={styles.pageIcon} />
      </button>
    </nav>
  );
}
