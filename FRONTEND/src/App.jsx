import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import QuoteModal from './components/QuoteModal';
import Hero from './components/Hero';
import CustomCursor from './components/CustomCursor';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Portal from './pages/Portal';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';

function MainLayout() {
  const location = useLocation();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [modalInitialProduct, setModalInitialProduct] = useState('');

  const isAdminOrLogin = location.pathname.startsWith('/admin') || location.pathname === '/login';

  const handleOpenQuoteModal = (productName = '') => {
    setModalInitialProduct(productName);
    setQuoteModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen inter-regular selection:bg-cyan-500 selection:text-white">
      <CustomCursor />
      {!isAdminOrLogin && <Navbar onOpenQuoteModal={handleOpenQuoteModal} />}
      {!isAdminOrLogin && <Hero onOpenQuoteModal={handleOpenQuoteModal} />}

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/products/:slug" element={<ProductDetails onOpenQuoteModal={handleOpenQuoteModal} />} />
          <Route path="/portal/*" element={<Portal />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>

      {!isAdminOrLogin && <Footer />}
      {!isAdminOrLogin && <FloatingActions />}

      {/* Global Request Quote Modal */}
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
      <MainLayout />
    </Router>
  );
}