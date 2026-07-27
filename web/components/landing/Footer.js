import Link from 'next/link';
import { motion } from 'framer-motion';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#preview' },
      { label: 'About', href: '#about' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log In', href: '/login' },
      { label: 'Create Account', href: '/signup' },
      { label: 'Support', href: '/support' },
    ],
  },
];

const socialLinks = [
  { icon: XIcon, href: 'https://twitter.com/techhive', label: 'X (Twitter)' },
  { icon: InstagramIcon, href: 'https://instagram.com/techhive', label: 'Instagram' },
  { icon: LinkedInIcon, href: 'https://linkedin.com/company/techhive', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 px-5 pb-8 pt-20 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="lg:col-span-6">
            <Link href="/" className="mb-6 inline-flex items-center gap-3">
              <img
                src="/assets/landing/logo.png"
                alt="Sentinelr Logo"
                className="h-10 w-10 rounded-xl object-contain"
              />
              <span className="font-display text-2xl font-bold text-deep-forest">Sentinelr</span>
            </Link>

            <p className="mb-6 max-w-[420px] font-body leading-relaxed text-gray-600">
              A connected family-safety platform for location visibility, emergency alerts, device
              management, and the moments that matter most.
            </p>

            <div className="mb-8 space-y-3">
              <a
                href="mailto:tekhive.dev@gmail.com"
                className="group flex items-center gap-3 text-gray-600 transition-colors hover:text-deep-forest"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-primary-green/10">
                  <EmailIcon className="text-sm" />
                </span>
                <span className="font-body text-sm">tekhive.dev@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <LocationOnIcon className="text-sm" />
                </span>
                <span className="font-body text-sm">Lagos, Nigeria</span>
              </div>
            </div>

            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-300 hover:border-primary-green hover:bg-primary-green hover:text-white"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-3">
              <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wider text-deep-forest">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 font-body text-sm text-gray-600 transition-colors hover:text-primary-green"
                    >
                      {link.label}
                      <ArrowForwardIcon className="-translate-x-2 text-xs opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-body text-sm text-gray-500">© 2026 Sentinelr. All rights reserved.</p>
          <p className="font-body text-sm text-gray-500">
            Crafted with care by{' '}
            <a
              href="https://techhives.dev"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="font-medium text-primary-green transition-colors hover:text-primary-green/80"
            >
              TechHive
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
