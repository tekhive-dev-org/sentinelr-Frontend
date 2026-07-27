import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { RealtimeSubscriptionProvider } from '../context/RealtimeSubscriptionContext';
import { NetworkProvider } from '../context/NetworkContext';
import NetworkStatusBanner from '../components/common/NetworkStatusBanner';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NetworkProvider>
        <NetworkStatusBanner />
        <AuthProvider>
          <RealtimeSubscriptionProvider>
            <Component {...pageProps} />
          </RealtimeSubscriptionProvider>
        </AuthProvider>
      </NetworkProvider>
    </>
  );
}
