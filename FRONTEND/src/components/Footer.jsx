import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import useParallax from '../hooks/useParallax';

export default function Footer() {
  const parallaxRef = useParallax(0.05);

  return (
    <footer className="relative z-10 bg-blue-950 text-slate-300 pt-12 pb-8">
      <div ref={parallaxRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-transform">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center shrink-0">
              <img src="/Logo_White.png" alt="CareDent" className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Dental equipment sales, installation, and technical support led by
              Mr. Sivakumar, {COMPANY_DETAILS.experienceYears} years in the industry.
            </p>
            <a
              href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Message us on WhatsApp
            </a>
          </div>

          {/* Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-slate-500">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-cyan-400 transition-colors">Products</Link></li>
              <li><Link to="/services" className="hover:text-cyan-400 transition-colors">Services & AMC</Link></li>
              <li><Link to="/track-order" className="hover:text-cyan-400 transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-slate-500">
              Contact
            </h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{COMPANY_DETAILS.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <a href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`} className="hover:text-cyan-400 transition-colors">
                  {COMPANY_DETAILS.phoneNumbers[0]}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-cyan-400 transition-colors">
                  {COMPANY_DETAILS.email}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Care Dent. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Portal Login</Link>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}