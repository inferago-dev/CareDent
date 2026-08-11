import React, { useState } from 'react';
import { X, CheckCircle2, Send, Stethoscope, Phone, Mail, User, Building, MapPin, Hash } from 'lucide-react';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';
import useMountedTransition from '../hooks/useMountedTransition';

export default function QuoteModal({ isOpen, onClose, initialProduct = '' }) {
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [formData, setFormData] = useState({
    product: initialProduct || 'Gamma Premium',
    quantity: 1,
    clinicName: '',
    doctorName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const shouldRender = useMountedTransition(isOpen, 200);
  if (!shouldRender) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomRef = 'CD-QT-' + Math.floor(100000 + Math.random() * 900000);
    setRefNumber(randomRef);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 ${isOpen ? 'animate-fade-in' : 'animate-fade-out'}`}>
      <div className={`bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 ${isOpen ? 'animate-scale-in' : 'animate-scale-out'}`}>

        {/* Modal Header */}
        <div className="bg-blue-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Request Official Quotation</h3>
              <p className="text-xs text-cyan-200">Pan-India Delivery & Certified Installation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Quotation Request Received!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, Doctor. Mr. Sivakumar and our sales engineering team will reach out to you within 24 hours with exact pricing, tax breakup, and delivery lead time.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block text-left">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference Code</div>
              <div className="text-xl font-mono font-bold text-cyan-600">{refNumber}</div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all"
              >
                Close & Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Product & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Selected Equipment *</label>
                <select
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                  <optgroup label="Dental Chairs (Gamma Series)">
                    {DENTAL_CHAIRS.map(c => (
                      <option key={c.id} value={c.name}>{c.name} Chair</option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Equipment">
                    {OTHER_EQUIPMENT.map(e => (
                      <option key={e.id} value={e.name}>{e.name} ({e.brand})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Doctor & Clinic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Sivakumar"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Clinic / Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Care Dental Clinic"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94441 53599"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="doctor@clinic.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Clinic Delivery Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Street address, City, Pincode (e.g. Mugalivakkam, Chennai)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Additional Requirements (Optional)</label>
              <input
                type="text"
                placeholder="Custom color, compressor requirement, AMC add-on..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold py-3 rounded-lg shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Submit Quotation Request</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
