import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import ComingSoon from '../../components/common/ComingSoon';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

export default function Content() {
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
      <ComingSoon
        title="Content Management"
        description="Create, edit, and manage educational content, safety resources, and in-app announcements."
        icon={DescriptionOutlinedIcon}
      />
    </DashboardLayout>
  );
}
