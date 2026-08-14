import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, ArrowRight, Menu, X, ChevronDown,
} from 'lucide-react';
import useCatalogue from '../hooks/useCatalogue';
import useMountedTransition from '../hooks/useMountedTransition';

export default function Navbar({ onOpenQuoteModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const { chairs } = useCatalogue();

  const location = useLocation();
  const navigate = useNavigate();

  const shouldRenderMegaMenu = useMountedTransition(megaMenuOpen, 150);
  const shouldRenderMobileMenu = useMountedTransition(mobileMenuOpen, 200);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products', hasDropdown: true },
    { name: 'Services', path: '/services' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Contact', path: '/contact' },
  ];

  const isLinkActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      {/* Main Header Navbar */}
      <header
        className={`fixed w-full top-0 z-40 backdrop-blur-lg transition-all duration-300 ${scrolled
          ? 'bg-blue-950/80 border-b border-white/10 shadow-lg shadow-blue-950/20'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src="/Logo_White_Badge.png"
                alt="Care Dent"
                width="494" height="512"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.name}
                      className="relative h-20 flex items-center group"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      <button
                        onClick={() => navigate('/products')}
                        className={`flex items-center gap-1 text-sm font-medium tracking-tight transition-colors ${active ? 'text-cyan-400' : 'text-slate-200 group-hover:text-cyan-400'
                          }`}
                      >
                        {link.name}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {shouldRenderMegaMenu && (
                        <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-[550px] bg-blue-950/95 backdrop-blur-xl shadow-2xl border border-white/10 p-6 grid grid-cols-2 gap-8 rounded-b-2xl overflow-hidden ${megaMenuOpen ? 'animate-drop-in' : 'animate-drop-out'}`}>
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Popular Models</h4>
                            <div className="space-y-3">
                              {chairs.slice(0, 4).map(chair => (
                                <Link
                                  key={chair._id || chair.id}
                                  to={`/products/${chair.slug}`}
                                  className="group/item flex items-center justify-between transition-colors"
                                  onClick={() => setMegaMenuOpen(false)}
                                >
                                  <span className="text-sm font-medium text-slate-200 group-hover/item:text-cyan-400">{chair.name}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover/item:text-cyan-400 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                </Link>
                              ))}
                            </div>
                            <Link
                              to="/products"
                              onClick={() => setMegaMenuOpen(false)}
                              className="inline-block mt-5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              View All Products →
                            </Link>
                          </div>

                          <div className="bg-white/5 -my-6 -mr-6 p-6 border-l border-white/10">
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Categories</h4>
                            <div className="space-y-3">
                              <Link to="/products?category=chairs" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">Dental Chairs</Link>
                              <Link to="/products?category=xray" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">X-Ray Units</Link>
                              <Link to="/products?category=autoclaves" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">Autoclaves</Link>
                              <Link to="/products?category=compressors" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">Compressors</Link>
                              <Link to="/products?category=scalers" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">Ultrasonic Scalers</Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium tracking-tight transition-colors ${active ? 'text-cyan-400' : 'text-slate-200 hover:text-cyan-400'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="hidden lg:flex items-center gap-6">

              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>

              <div className="w-px h-5 bg-white/20" />

              <button
                onClick={() => onOpenQuoteModal && onOpenQuoteModal()}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-5 py-2.5 transition-all active:scale-95"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-200 hover:text-cyan-400 transition-transform duration-200"
                style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {shouldRenderMobileMenu && (
          <div className={`lg:hidden border-t border-white/10 bg-blue-950/95 backdrop-blur-xl px-6 pt-4 pb-8 space-y-6 origin-top ${mobileMenuOpen ? 'animate-drop-in' : 'animate-drop-out'}`}>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block py-2.5 text-base font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-200 hover:text-cyan-400'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 rounded-full border border-white/20 py-2.5 text-slate-200 font-medium text-sm hover:border-cyan-400 hover:text-cyan-400 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Customer Portal Login</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal && onOpenQuoteModal();
                }}
                className="w-full rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

    </>
  );
}