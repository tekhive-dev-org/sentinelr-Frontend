import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, SubscriptionManagement, UserSubscription } from '../../components/dashboard';
import { FullPageLoader } from '../../components/ui/loaders';

export default function Subscription() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageLoader message="Loading subscription…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      {user?.role === 'admin' ? (
        <SubscriptionManagement />
      ) : (
        <UserSubscription />
      )}
    </DashboardLayout>
  );
}
