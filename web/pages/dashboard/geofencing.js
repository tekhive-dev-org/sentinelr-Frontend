import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, GeofencingDashboard } from '../../components/dashboard';
import { FullPageLoader } from '../../components/ui/loaders';

export default function Geofencing() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageLoader message="Loading geofencing…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <GeofencingDashboard />
    </DashboardLayout>
  );
}
