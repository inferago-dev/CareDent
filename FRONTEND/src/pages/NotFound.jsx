import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Phone } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';

export default function NotFound() {
  return (
    <div className="relative overflow-hidden min-h-[70vh] bg-blue-950 text-white flex items-center">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen -translate-y-1/2" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
          Error 404
        </span>
        <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
          This page has been moved or never existed
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto mt-6">
          Check the address, or jump back to the catalogue — every chair and every piece of
          equipment we supply is listed there.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3.5 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 hover:border-cyan-400 text-white font-medium text-sm px-6 py-3.5 transition-colors"
          >
            <Search className="w-4 h-4" /> Browse products
          </Link>
        </div>

        <a
          href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
          className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> Or call us on {COMPANY_DETAILS.phoneNumbers[0]}
        </a>
      </div>
    </div>
  );
}
