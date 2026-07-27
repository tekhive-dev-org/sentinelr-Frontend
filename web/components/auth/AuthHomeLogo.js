import Image from 'next/image';
import Link from 'next/link';

export default function AuthHomeLogo({ className, width = 80, height = 80, priority = false }) {
  return (
    <Link href="/" aria-label="Go to Sentinelr home page">
      <Image
        src="/logo.png"
        alt="Sentinelr"
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    </Link>
  );
}
