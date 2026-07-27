import Image from 'next/image';
import { motion } from 'framer-motion';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ANDROID_APP_URL =
  'https://play.google.com/store/apps/details?id=com.techhive.sentinelr';
const IOS_APP_URL = 'https://apps.apple.com/ng/app/sentinelr/id6783405827';

const appBenefits = [
  'Live location sharing',
  'One-tap SOS alerts',
  'Secure device pairing',
];

export default function GetAppSection() {
  return (
    <section className="bg-white px-5 py-20 md:px-10 md:py-28" id="download">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="mb-4 inline-block rounded-full bg-primary-green/10 px-4 py-2 text-sm font-semibold text-primary-green">
            Mobile Apps
          </span>
          <h2 className="mb-6 font-display text-3xl font-bold text-deep-forest md:text-4xl lg:text-5xl">
            Take Sentinelr <span className="text-primary-green">wherever you go</span>
          </h2>
          <p className="mx-auto max-w-[640px] font-body text-base leading-relaxed text-gray-600 md:text-lg">
            Connect your phone to your family safety network for location sharing, emergency alerts,
            and secure device pairing.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.article
            className="rounded-3xl border border-gray-100 bg-gray-50 p-7 shadow-[0_8px_30px_rgba(18,6,30,0.06)] md:p-9"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f6ec] text-[#238636]">
                <AndroidIcon fontSize="large" />
              </div>
              <span className="rounded-full bg-[#e7f6ec] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#238636]">
                Available now
              </span>
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-deep-forest">Sentinelr for Android</h3>
            <p className="mb-6 font-body leading-relaxed text-gray-600">
              Download the Android app from Google Play and pair your device with your Sentinelr
              dashboard.
            </p>
            <ul className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {appBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 font-body text-sm text-gray-700">
                  <CheckCircleIcon className="text-base text-primary-green" />
                  {benefit}
                </li>
              ))}
            </ul>
            <a
              href={ANDROID_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center gap-3 rounded-2xl bg-deep-forest px-6 py-3 text-white shadow-[0_8px_20px_rgba(18,6,30,0.2)] transition-all hover:-translate-y-0.5 hover:bg-deep-forest/90"
              aria-label="Download Sentinelr from Google Play"
            >
              <Image
                src="/assets/icons/playstore.png"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
              />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-widest text-white/70">Get it on</span>
                <span className="font-semibold">Google Play</span>
              </span>
              <ArrowOutwardIcon className="ml-2 text-lg" />
            </a>
          </motion.article>

          <motion.article
            className="rounded-3xl border border-gray-100 bg-gray-50 p-7 shadow-[0_8px_30px_rgba(18,6,30,0.06)] md:p-9"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaf8] text-deep-forest">
                <AppleIcon fontSize="large" />
              </div>
              <span className="rounded-full bg-[#e7f6ec] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#238636]">
                Available now
              </span>
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-deep-forest">Sentinelr for iPhone</h3>
            <p className="mb-6 font-body leading-relaxed text-gray-600">
              Download the iPhone app from the App Store and connect it to your Sentinelr family
              safety network.
            </p>
            <ul className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {appBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 font-body text-sm text-gray-700">
                  <CheckCircleIcon className="text-base text-primary-green" />
                  {benefit}
                </li>
              ))}
            </ul>
            <a
              href={IOS_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center gap-3 rounded-2xl bg-deep-forest px-6 py-3 text-white shadow-[0_8px_20px_rgba(18,6,30,0.2)] transition-all hover:-translate-y-0.5 hover:bg-deep-forest/90"
              aria-label="Download Sentinelr from the App Store"
            >
              <AppleIcon fontSize="large" />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-widest text-white/70">Download on the</span>
                <span className="font-semibold">App Store</span>
              </span>
              <ArrowOutwardIcon className="ml-2 text-lg" />
            </a>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
