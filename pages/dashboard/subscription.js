import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';

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
      <div style={{ padding: '0 32px 32px' }} className="dashboard-content">
        <style jsx>{`
          @media (max-width: 768px) {
            .dashboard-content {
              padding: 0 16px 16px !important;
            }
          }
        `}</style>
        <p>Subscription Management content will go here</p>
      </div>
    </DashboardLayout>
  );
}
