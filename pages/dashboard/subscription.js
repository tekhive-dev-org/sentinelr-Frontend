import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, SubscriptionManagement } from '../../components/dashboard';

export default function Subscription() {
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
<SubscriptionManagement />
    </DashboardLayout>
  );
}
