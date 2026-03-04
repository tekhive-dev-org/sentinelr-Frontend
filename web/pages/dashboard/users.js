import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import ComingSoon from '../../components/common/ComingSoon';
import GroupIcon from '@mui/icons-material/Group';

export default function Users() {
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
        title="Users & Family Management"
        description="View, manage, and organize all registered users and family groups in one place."
        icon={GroupIcon}
      />
    </DashboardLayout>
  );
}
