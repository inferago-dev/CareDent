import React, { useState, useCallback } from 'react';
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
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import Portal from './pages/Portal';
import Login from './pages/Login';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

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
          <Route path="/services" element={<Services onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route
            path="/portal/*"
            element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
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
