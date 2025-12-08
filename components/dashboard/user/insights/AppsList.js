import Image from 'next/image';
import LoadingSpinner from '../../../ui/LoadingSpinner';

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
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Most Used Apps</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Total screen time for each app used.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
             <LoadingSpinner />
        ) : apps?.map((app) => (
          <div key={app.id} style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr auto',
            alignItems: 'center', 
            padding: '16px 24px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px',
            background: '#fff'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#4b5563', fontSize: '13px', marginBottom: '4px' }}>{app.name}</span>
                <span style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{app.subval}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#4b5563', fontSize: '13px', marginBottom: '4px' }}>Time Spent</span>
                <span style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{app.time}</span>
            </div>
            
            <Image 
                src={app.icon} 
                alt={app.name} 
                width={56} 
                height={56} 
                style={{ borderRadius: '12px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
