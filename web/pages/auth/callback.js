import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { loginWithGoogleCallback } = useAuth();
  const [status, setStatus] = useState('Processing your login...');

  useEffect(() => {
    if (!router.isReady) return;

    const handleCallback = async () => {
      const { token, error } = router.query;

      if (error) {
        setStatus('Authentication failed. Redirecting to login...');
        setTimeout(() => router.push('/login?error=google_auth_failed'), 2000);
        return;
      }

      if (!token) {
        setStatus('No token received. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const result = await loginWithGoogleCallback(token);

      if (result.success) {
        setStatus('Login successful! Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        setStatus('Authentication failed. Redirecting to login...');
        setTimeout(() => router.push('/login?error=google_auth_failed'), 2000);
      }
    };

    handleCallback();
  }, [router.isReady, loginWithGoogleCallback]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0E4B68 0%, #0C3D54 50%, #083344 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(255,255,255,0.2)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 24,
        }}
      />
      <p style={{ fontSize: 18, fontWeight: 500 }}>{status}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
