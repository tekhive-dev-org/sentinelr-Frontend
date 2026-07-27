import Link from 'next/link';
import { motion } from 'framer-motion';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const benefits = [
  {
    icon: SecurityIcon,
    title: 'Secure family dashboard',
    description: 'Manage family members, devices, and safety settings from one place.',
  },
  {
    icon: LocationOnIcon,
    title: 'Live location visibility',
    description: 'View the latest shared device locations and important status updates.',
  },
  {
    icon: NotificationsActiveIcon,
    title: 'Actionable safety alerts',
    description: 'Stay informed about SOS events, geofences, and device activity.',
  },
];

export default function AccessCTA() {
  return (
    <section className="bg-white px-5 py-20 md:px-10 md:py-28" id="contact">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          className="overflow-hidden rounded-3xl bg-deep-forest px-6 py-12 text-white shadow-[0_20px_60px_rgba(18,6,30,0.2)] md:px-12 md:py-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#f2b88e]">
                Get Started
              </span>
              <h2 className="mb-5 font-display text-3xl font-bold leading-tight md:text-5xl">
                Bring your family’s safety into one connected experience.
              </h2>
              <p className="mb-8 max-w-[620px] font-body text-base leading-relaxed text-white/70 md:text-lg">
                Create an account to set up your family dashboard, or log in to continue managing
                your connected devices and alerts.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-green px-7 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-green/90"
                >
                  <PersonAddIcon />
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <LoginIcon />
                  Log In
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {benefits.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5"
                >
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-green/20 text-[#f2b88e]">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="mb-1 font-display text-lg font-semibold">{title}</h3>
                    <p className="font-body text-sm leading-relaxed text-white/65">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
