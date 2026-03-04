import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import ComingSoon from '../../components/common/ComingSoon';
import SosIcon from '@mui/icons-material/Sos';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export default function Alerts() {
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

  const isAdmin = user.role === 'admin';

  return (
    <DashboardLayout>
      <ComingSoon
        title={isAdmin ? 'Alert & Report Handling' : 'SOS Alert'}
        description={
          isAdmin
            ? 'Review and manage user-generated alerts, incidents, and reports from one central hub.'
            : 'Trigger emergency SOS alerts and notify your trusted contacts instantly when you need help.'
        }
        icon={isAdmin ? ReportProblemIcon : SosIcon}
      />
    </DashboardLayout>
  );
}
