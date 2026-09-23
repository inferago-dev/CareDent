import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import useParallax from '../hooks/useParallax';
import Reveal from './Reveal';

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.776 0-3.518-.47-5.047-1.36l-.362-.212-3.75.983.999-3.657-.233-.371C2.709 15.65 1.936 13.565 1.936 11.38 1.938 5.767 6.505 1.2 12.052 1.2c2.688 0 5.215 1.048 7.114 2.951A10.007 10.007 0 0 1 22.118 11.38c-.002 5.613-4.568 10.181-10.067 10.181m0-18.423c-4.542 0-8.238 3.696-8.24 8.242 0 1.792.576 3.497 1.637 4.907l.215.287-.594 2.17 2.22-.582.277.165a8.214 8.214 0 0 0 4.483 1.314h.004c4.54 0 8.238-3.696 8.24-8.242a8.19 8.19 0 0 0-2.414-5.83 8.188 8.188 0 0 0-5.833-2.417" />
    </svg>
  );
}

export default function Footer() {
  const parallaxRef = useParallax(0.05);

  return (
    <footer className="relative z-10 bg-blue-950 text-slate-300 pt-16 pb-8">
      <div ref={parallaxRef} className="container-page max-w-7xl will-change-transform">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <Reveal className="sm:col-span-2 lg:col-span-4 space-y-4" variant="left" x={30}>
            <Link to="/" className="flex items-center shrink-0">
              <img
                src="/Logo_White_Lockup.png"
                alt="Care Dent - We care for your precious equipments"
                width="152" height="192"
                className="h-16 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm tracking-tight">
              Dental equipment sales, installation, and technical support led by
              Mr. Sivakumar, {COMPANY_DETAILS.experienceYears} years in the industry.
            </p>
            <a
              href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-cyan-600/20 hover:bg-cyan-600/50 text-cyan-400 px-3.5 py-2 rounded-full transition-all tracking-tight"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Message us on WhatsApp</span>
            </a>
          </Reveal>

          {/* Links Column 1: Company */}
          <Reveal className="lg:col-span-2 space-y-3" delay={80} y={20}>
            <h4 className="text-sm uppercase text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400 tracking-tight">
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-cyan-400 transition-colors">Products</Link></li>
              <li><Link to="/services" className="hover:text-cyan-400 transition-colors">Services &amp; Support</Link></li>
              <li><Link to="/gallery" className="hover:text-cyan-400 transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
            </ul>
          </Reveal>

          {/* Links Column 2: Resources & Solutions */}
          <Reveal className="lg:col-span-3 space-y-3" delay={160} y={20}>
            <h4 className="text-sm uppercase text-white">
              Resources &amp; Solutions
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400 tracking-tight">
              <li><Link to="/services/pre-installation" className="hover:text-cyan-400 transition-colors">Pre-Installation Checklist</Link></li>
              <li><Link to="/dental-clinic-setup" className="hover:text-cyan-400 transition-colors">Clinic Setup Guide</Link></li>
              <li><Link to="/dental-chair-service-chennai" className="hover:text-cyan-400 transition-colors">Chair Service in Chennai</Link></li>
              <li><Link to="/guides" className="hover:text-cyan-400 transition-colors">Guides &amp; Articles</Link></li>
              <li><Link to="/track-order" className="hover:text-cyan-400 transition-colors">Track Order</Link></li>
            </ul>
          </Reveal>

          {/* Contact */}
          <Reveal className="lg:col-span-3 space-y-3" delay={240} y={20}>
            <h4 className="text-sm uppercase text-white">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm text-slate-400 tracking-tight">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{COMPANY_DETAILS.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={COMPANY_DETAILS.phoneHrefs[0]} className="hover:text-cyan-400 transition-colors">
                  {COMPANY_DETAILS.phoneNumbers[0]}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-cyan-400 transition-colors">
                  {COMPANY_DETAILS.email}
                </a>
              </div>
            </div>
          </Reveal>

        </div>

        {/* Bottom bar */}
        <Reveal delay={300} y={12}>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 tracking-tight">
            <span>© {new Date().getFullYear()} Care Dent. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-cyan-400 transition-colors">Portal Login</Link>
              <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
            </div>
          </div>
        </Reveal>

      </div>
    </footer>
  );
}