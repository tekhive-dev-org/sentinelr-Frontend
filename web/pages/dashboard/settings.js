import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, UserSettings } from '../../components/dashboard';
import { FullPageLoader } from '../../components/ui/loaders';

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
      <UserSettings user={user} />
    </DashboardLayout>
  );
}
