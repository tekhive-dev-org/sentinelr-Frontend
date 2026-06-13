import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, HistoryReports } from '../../components/dashboard';
import { FullPageLoader } from '../../components/ui/loaders';

export default function History() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageLoader message="Loading history…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <HistoryReports />
    </DashboardLayout>
  );
}
