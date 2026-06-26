import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import InsightsDashboard from '../../components/dashboard/user/insights/InsightsDashboard';
import { FullPageLoader } from '../../components/ui/loaders';

export default function Insights() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <FullPageLoader message="Loading insights…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <InsightsDashboard />
    </DashboardLayout>
  );
}
