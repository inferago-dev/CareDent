import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, User, ArrowRight, Menu, X, ChevronDown,
} from 'lucide-react';
import { DENTAL_CHAIRS } from '../data/products';
import useMountedTransition from '../hooks/useMountedTransition';

export default function Navbar({ onOpenQuoteModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const shouldRenderMegaMenu = useMountedTransition(megaMenuOpen, 150);
  const shouldRenderMobileMenu = useMountedTransition(mobileMenuOpen, 200);
  const shouldRenderSearch = useMountedTransition(searchOpen, 200);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

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
        className="sticky top-0 z-40 bg-blue-950 duration-300
          "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img src="/Logo.png" alt="CareDent" className="h-9 w-auto object-contain" />
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
                        <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-[550px] bg-white shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-8 rounded-b-xl overflow-hidden ${megaMenuOpen ? 'animate-drop-in' : 'animate-drop-out'}`}>
                          <div>
                            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Popular Models</h4>
                            <div className="space-y-3">
                              {DENTAL_CHAIRS.slice(0, 4).map(chair => (
                                <Link
                                  key={chair.id}
                                  to={`/products/${chair.slug}`}
                                  className="group/item flex items-center justify-between transition-colors"
                                  onClick={() => setMegaMenuOpen(false)}
                                >
                                  <span className="text-sm font-medium text-slate-700 group-hover/item:text-cyan-700">{chair.name}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover/item:text-cyan-700 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                </Link>
                              ))}
                            </div>
                            <Link
                              to="/products"
                              onClick={() => setMegaMenuOpen(false)}
                              className="inline-block mt-5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
                            >
                              View All Products →
                            </Link>
                          </div>

                          <div className="bg-slate-50 -my-6 -mr-6 p-6 border-l border-slate-100">
                            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Categories</h4>
                            <div className="space-y-3">
                              <Link to="/products?category=chairs" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-cyan-700 transition-colors">Dental Chairs</Link>
                              <Link to="/products?category=xray" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-cyan-700 transition-colors">X-Ray Units</Link>
                              <Link to="/products?category=autoclaves" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-cyan-700 transition-colors">Autoclaves</Link>
                              <Link to="/products?category=compressors" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-cyan-700 transition-colors">Compressors</Link>
                              <Link to="/products?category=scalers" onClick={() => setMegaMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-cyan-700 transition-colors">Ultrasonic Scalers</Link>
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
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-slate-200 hover:text-cyan-400 transition-colors"
                title="Search products"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

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
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-slate-200 hover:text-cyan-400"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
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
          <div className={`lg:hidden border-t border-slate-100 bg-white px-6 pt-4 pb-8 space-y-6 origin-top ${mobileMenuOpen ? 'animate-drop-in' : 'animate-drop-out'}`}>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block py-2.5 text-base font-medium transition-colors ${active ? 'text-cyan-700' : 'text-slate-700 hover:text-cyan-700'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 border border-slate-200 py-2.5 text-slate-700 font-medium text-sm hover:border-cyan-700 hover:text-cyan-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Customer Portal Login</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal && onOpenQuoteModal();
                }}
                className="w-full bg-slate-900 hover:bg-cyan-700 text-white font-medium py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {shouldRenderSearch && (
        <div
          className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4 ${searchOpen ? 'animate-fade-in' : 'animate-fade-out'}`}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className={`bg-white w-full max-w-2xl shadow-xl overflow-hidden ${searchOpen ? 'animate-drop-in' : 'animate-drop-out'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Gamma chairs, X-Ray units, Autoclaves, Scalers…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-[15px] text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            <div className="p-5 max-h-80 overflow-y-auto">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-3">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Gamma Premium', 'Gamma Overhanging', 'X-Ray Units', 'Woodpecker Scaler', 'Autoclave', 'Oil-Free Compressor'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/products?q=${encodeURIComponent(term)}`);
                      setSearchOpen(false);
                    }}
                    className="text-xs text-slate-600 hover:text-cyan-700 border border-slate-200 hover:border-cyan-700 px-3 py-1.5 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-3">
                Quick Models
              </div>
              <div className="space-y-1">
                {DENTAL_CHAIRS.map((chair) => (
                  <Link
                    key={chair.id}
                    to={`/products/${chair.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900">{chair.name}</span>
                      <span className="text-xs text-slate-500 ml-2">— {chair.tagline}</span>
                    </div>
                    <span className="text-xs font-medium text-cyan-700">View →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}