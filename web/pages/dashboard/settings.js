import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, UserSettings } from '../../components/dashboard';
import { FullPageLoader } from '../../components/ui/loaders';
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
    return <FullPageLoader message="Loading settings…" />;
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
