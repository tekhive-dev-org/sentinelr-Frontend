import Image from 'next/image';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import styles from './AppsList.module.css';

export default function AppsList({ apps, loading }) {

  // For now I will assume they need to be added or use generic ones, but based on the prompt "use Image tool...", 
  // I should probably stick to what's available or use placeholders. 
  // I saw earlier only a few icons. I'll placeholders for now and could ask user or use what's there. 
  // Actually, I'll use a helper to render a colored box if icon missing or use the 'user.png' generic if needed, 
  // but let's try to match the design's "Youtube", "Tiktok" etc.
  // Since I don't have the specific brand icons in the file list I saw (only bank-card, user, settings etc), 
  // I will use a placeholder approach or standard icons if I had them. 
  // TO BE SAFE: I'll use a Colored Box with the first letter if I can't find the icon, OR just reuse the 'layout-grid.png' style for now.
  // WAIT, the user provided images showed specific icons. I should probably tell the user I need those icons or I will use placeholders.
  // I'll implement with the expectation that I might need to add them. 
  // For this step I will link to presumed paths.

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Most Used Apps</h3>
      <p className={styles.subtext}>Total screen time for each app used.</p>

      <div className={styles.list}>
        {loading ? (
             <LoadingSpinner />
        ) : apps?.map((app) => (
          <div key={app.id} className={styles.appItem}>
            <div className={styles.column}>
                <span className={styles.label}>{app.name}</span>
                <span className={styles.value}>{app.subval}</span>
            </div>
            
            <div className={styles.column}>
                <span className={styles.label}>Time Spent</span>
                <span className={styles.value}>{app.time}</span>
            </div>
            
            <Image 
                src={app.icon} 
                alt={app.name} 
                width={56} 
                height={56} 
                className={styles.appIcon}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
