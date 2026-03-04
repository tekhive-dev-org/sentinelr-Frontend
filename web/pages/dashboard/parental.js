import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import ComingSoon from '../../components/common/ComingSoon';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Parental() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <ComingSoon
        title="Parental Control"
        description="Set screen time limits, content filters, and app restrictions to keep your family safe online."
        icon={AdminPanelSettingsIcon}
      />
    </DashboardLayout>
  );
}
