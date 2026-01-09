import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import VerificationCode from '../components/auth/VerificationCode';

export default function Verify() {
  const router = useRouter();
  const { email: queryEmail } = router.query;
  const [email, setEmail] = useState('');

  useEffect(() => {
    // First try query param, then localStorage
    if (queryEmail) {
      setEmail(queryEmail);
    } else if (typeof window !== 'undefined') {
      const pendingUser = localStorage.getItem('pending_user');
      if (pendingUser) {
        const parsed = JSON.parse(pendingUser);
        if (parsed.email) {
          setEmail(parsed.email);
          return;
        }
      }
      // No email available, redirect to signup
      router.replace('/signup');
    }
  }, [queryEmail, router]);

  // Show loading while determining email
  if (!email) {
    return null;
  }
  
  return <VerificationCode email={email} />;
}
