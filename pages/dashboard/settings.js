import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import UserSettings from '../../components/dashboard/user/Settings/UserSettings';

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
        <div style={{ padding: '0 32px 32px' }}>
          <p>Admin Settings (Coming Soon)</p>
        </div>
      )}
    </DashboardLayout>
  );
}
