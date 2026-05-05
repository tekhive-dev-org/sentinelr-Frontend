import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/404.module.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 – Page Not Found | Sentinelr</title>
      </Head>

      <div className={styles.page}>
        {/* Background orbs */}
        <div className={styles.orb1} aria-hidden="true" />
        <div className={styles.orb2} aria-hidden="true" />

        <div className={styles.card}>
          {/* Logo */}
          <div className={styles.logoRow}>
             <Image
              src="/favicon.png"
              alt="Sentinelr"
              width={140}
              height={40}
              className={styles.logo}
              priority
            />
           
          </div>

          {/* Large 404 number */}
          <div className={styles.errorCode} aria-hidden="true">
            <span className={styles.four}>4</span>
            <span className={styles.zero}>
              {/* Shield icon in the middle zero */}
              <svg viewBox="0 0 80 80" fill="none" className={styles.shieldSvg} aria-hidden="true">
                <path
                  d="M40 8L14 20v20c0 15.5 11.2 30 26 34 14.8-4 26-18.5 26-34V20L40 8z"
                  fill="rgba(255,255,255,0.12)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M29 40l8 8 14-14"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.four}>4</span>
          </div>

          <h1 className={styles.heading}>Page not found</h1>
          <p className={styles.body}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            <br />
            Double-check the URL or head back to safety.
          </p>

          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.btnPrimary}>
              Go to Dashboard
            </Link>
            <button className={styles.btnSecondary} onClick={() => router.back()}>
              Go Back
            </button>
          </div>
        </div>

        <p className={styles.footer}>
          &copy; {new Date().getFullYear()} Sentinelr &mdash; Family Safety Platform
        </p>
      </div>
    </>
  );
}
