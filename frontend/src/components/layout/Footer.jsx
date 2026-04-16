import { Link } from 'react-router-dom'
import { MdRestaurantMenu } from 'react-icons/md'
import { FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
                <MdRestaurantMenu className="text-white text-lg" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Cater<span className="gradient-text">Connect</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              India's verified catering marketplace. Connecting trusted caterers with customers since 2024.
            </p>
            <div className="flex gap-3 mt-4">
              {[FiInstagram, FiTwitter, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-lg glass-sm flex items-center justify-center text-white/40 hover:text-white hover:border-brand-500/30 transition-all text-sm">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {['Find Caterers', 'Become a Caterer', 'How It Works', 'Pricing'].map((t) => (
                <li key={t}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((t) => (
                <li key={t}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li>support@caterconnect.in</li>
              <li>+91 98765 43210</li>
              <li>Ahmedabad, Gujarat</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} CaterConnect. All rights reserved.</p>
          <p className="text-white/25 text-xs">Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  )
}
