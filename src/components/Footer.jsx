import { Link } from 'react-router-dom'
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi'
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'
import TKLogo from './TKLogo'

const footerLinks = {
  'Quick Links': [
    { name: 'Home', to: '/' },
    { name: 'About Us', to: '/about' },
    { name: 'Services', to: '/services' },
    { name: 'Contact Us', to: '/contact' },
  ],
  'Our Services': [
    { name: 'Security Guard', to: '/services' },
    { name: 'Vehicle Patrol', to: '/services' },
    { name: 'Corporate Security', to: '/services' },
    { name: 'Event Security', to: '/services' },
  ],
}

const socials = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <TKLogo className="w-11 h-11 drop-shadow-lg" />
              <span className="text-xl font-bold text-white">TK Security</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Professional security services protecting businesses and individuals across
              Southern California. Our commitment to excellence is unwavering.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600/30 transition-all"
                >
                  <s.icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <HiLocationMarker className="text-blue-400 text-lg flex-shrink-0 mt-0.5" />
                <span>10747 Reseda Blvd<br />Portal Ranch, CA 91326, USA</span>
              </li>
              <li>
                <a href="tel:+18187075382" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                  <HiPhone className="text-blue-400 text-lg flex-shrink-0" />
                  +1 (818) 707-5382
                </a>
              </li>
              <li>
                <a href="mailto:operations@tksecurityinc.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                  <HiMail className="text-blue-400 text-lg flex-shrink-0" />
                  operations@tksecurityinc.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full">
            <p className="text-sm text-slate-500">
              © 2026 TK Security Inc. All Rights Reserved.
            </p>
            <p className="text-sm text-slate-500 sm:ml-8">
              Professional Safety & Security Protection Services
            </p>
            <p className="text-xs text-slate-400 sm:ml-8 mt-2 sm:mt-0">
              Developed by Mazharul Abir
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
