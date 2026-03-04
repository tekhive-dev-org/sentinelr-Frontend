import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import ComingSoon from '../../components/common/ComingSoon';
import FenceIcon from '@mui/icons-material/Fence';

export default function Geofencing() {
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
        title="Geofencing"
        description="Create virtual boundaries and receive instant alerts when devices enter or leave designated zones."
        icon={FenceIcon}
      />
    </DashboardLayout>
  );
}
