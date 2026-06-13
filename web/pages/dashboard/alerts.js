import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, SOSAlert } from '../../components/dashboard';
import { FullPageLoader } from '../../components/ui/loaders';
import ComingSoon from '../../components/common/ComingSoon';
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
    return <FullPageLoader message="Loading alerts…" />;
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  return (
    <DashboardLayout>
      {isAdmin ? (
        <ComingSoon
          title="Alert & Report Handling"
          description="Review and manage user-generated alerts, incidents, and reports from one central hub."
          icon={ReportProblemIcon}
        />
      ) : (
        <SOSAlert />
      )}
    </DashboardLayout>
  );
}
