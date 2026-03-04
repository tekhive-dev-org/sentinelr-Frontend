import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, UserSettings } from '../../components/dashboard';
import ComingSoon from '../../components/common/ComingSoon';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Settings() {
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
      {user.role !== 'admin' ? (
        <UserSettings user={user} />
      ) : (
        <ComingSoon
          title="Admin Settings"
          description="Configure platform-wide settings, manage roles, and customize system preferences."
          icon={SettingsIcon}
        />
      )}
    </DashboardLayout>
  );
}
