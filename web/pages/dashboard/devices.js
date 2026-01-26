import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import { DevicesAndUsers } from '../../components/dashboard/user/devices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Devices() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <DevicesAndUsers />
    </DashboardLayout>
  );
}
