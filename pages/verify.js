import { useRouter } from 'next/router';
import VerificationCode from '../components/auth/VerificationCode';

export default function Verify() {
  const router = useRouter();
  const { email } = router.query;
  
  return <VerificationCode email={email || 'user@sentinelr.com'} />;
}
