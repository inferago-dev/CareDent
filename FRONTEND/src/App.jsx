import { Suspense, lazy, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import QuoteModal from './components/QuoteModal';
import Hero from './components/Hero';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Services from './pages/Services';
import PreInstallation from './pages/PreInstallation';
import Gallery from './pages/Gallery';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import ClinicSetup from './pages/ClinicSetup';
import ChennaiService from './pages/ChennaiService';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

/**
 * The back-office is the largest screen in the app by a wide margin, and the
 * portal is not far behind - but nobody browsing the catalogue on a phone will
 * ever open either. Loading them on demand keeps them out of the bundle every
 * marketing visitor pays for.
 */
const Portal = lazy(() => import('./pages/Portal'));
const Admin = lazy(() => import('./pages/Admin'));

/** Shown for the moment a lazily-loaded screen is still arriving. Matches the
 *  splash ProtectedRoute already uses while it checks the session, so the two
 *  waits read as one. */
function RouteFallback() {
  return (
    <div className="min-h-screen bg-blue-950 text-white flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-cyan-400 animate-spin" />
      <p className="text-sm text-slate-400">Loading…</p>
    </div>
  );
}

/** Routes that render their own full-screen chrome (no navbar/footer/hero). */
const BARE_ROUTES = ['/admin', '/login', '/portal'];

function MainLayout() {
  const location = useLocation();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [modalInitialProduct, setModalInitialProduct] = useState('');

  const isBare = BARE_ROUTES.some((p) => location.pathname.startsWith(p));

  // The hero is the home page's opening panel - it must not repeat above
  // About / Products / Services, which have their own headers.
  const showHero = location.pathname === '/';

  const handleOpenQuoteModal = useCallback((productName = '') => {
    setModalInitialProduct(typeof productName === 'string' ? productName : '');
    setQuoteModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen inter-regular selection:bg-cyan-500 selection:text-white">
      {!isBare && <Navbar onOpenQuoteModal={handleOpenQuoteModal} />}
      {showHero && <Hero onOpenQuoteModal={handleOpenQuoteModal} />}

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/about" element={<About onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/products" element={<Products onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/products/:slug" element={<ProductDetails onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/pre-installation" element={<PreInstallation onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/gallery" element={<Gallery onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:slug" element={<GuideDetail onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/dental-clinic-setup" element={<ClinicSetup onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/dental-chair-service-chennai" element={<ChennaiService onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route
            path="/portal/*"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <Portal />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <Suspense fallback={<RouteFallback />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isBare && <Footer />}
      {!isBare && <FloatingActions />}

      {/* Global Request Quote modal, opened from anywhere via onOpenQuoteModal */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialProduct={modalInitialProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}
