import React from 'react';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import styles from '../ParentalControl.module.css';

export default function WebFilteringManager({
  webFilter = null,
  showAddSite = false,
  setShowAddSite = () => {},
  newSiteUrl = '',
  setNewSiteUrl = () => {},
  siteSearch = '',
  setSiteSearch = () => {},
  handleAddSite = () => {},
  handleRemoveSite = () => {},
}) {
  if (!webFilter) return null;

  const blockedSites = webFilter.blockedSites || [];
  const filteredSites = blockedSites.filter(s =>
    s.toLowerCase().includes(siteSearch.toLowerCase())
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>
          <span className={`${styles.cardTitleIcon} ${styles.iconYellow}`}>
            <LanguageRoundedIcon />
          </span>
          Web Filtering
        </span>
        <button className={styles.addWebsiteBtn} onClick={() => setShowAddSite(!showAddSite)}>
          {showAddSite ? 'Cancel' : 'Block Website'}
        </button>
      </div>

      {showAddSite && (
        <form className={styles.addSiteForm} onSubmit={handleAddSite}>
          <input
            className={styles.addSiteInput}
            placeholder="e.g. facebook.com"
            value={newSiteUrl}
            onChange={(e) => setNewSiteUrl(e.target.value)}
          />
          <button className={styles.addSiteSubmit} type="submit">Block</button>
        </form>
      )}

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <SearchRoundedIcon />
        </span>
        <input
          className={styles.searchInput}
          placeholder="Search blocked URLs..."
          value={siteSearch}
          onChange={(e) => setSiteSearch(e.target.value)}
        />
      </div>

      <div className={styles.blockedSitesList}>
        {filteredSites.length === 0 ? (
          <span className={styles.emptyListText}>
            No blocked sites matching query
          </span>
        ) : (
          filteredSites.map((site) => (
            <div key={site} className={styles.blockedSiteItem}>
              <div className={styles.blockedSiteInfo}>
                <span className={styles.siteIcon}>
                  <LockRoundedIcon />
                </span>
                <span className={styles.siteName}>{site}</span>
              </div>
              <button
                className={styles.removeSiteBtn}
                onClick={() => handleRemoveSite(site)}
                title="Remove"
              >
                <DeleteOutlineRoundedIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
