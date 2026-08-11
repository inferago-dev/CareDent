import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('customer'); // 'customer' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img src="/Logo_White.png" alt="CareDent" className="h-9 mx-auto w-auto object-contain" />
          </Link>
          <div>
            <h2 className="text-xl tracking-tight font-medium">Sign in to your account</h2>
            <p className="text-sm text-slate-400 mt-1">Access orders, quotations, and service logs</p>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 border-b border-white/10 text-sm font-medium">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-3 border-b-2 transition-colors ${role === 'customer' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Customer Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-3 border-b-2 transition-colors ${role === 'admin' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Admin Dashboard
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-400">
              {role === 'admin' ? 'Admin Email' : 'Email or Registered Mobile'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder={role === 'admin' ? 'admin@caredent.com' : 'you@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-6 pr-0 py-2.5 bg-transparent border-b border-white/15 text-white text-sm placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-6 pr-0 py-2.5 bg-transparent border-b border-white/15 text-white text-sm placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-600 bg-transparent text-cyan-500 focus:ring-0 focus:ring-offset-0" defaultChecked />
              <span>Keep me signed in</span>
            </label>
            <a href="#" className="hover:text-cyan-400 transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-blue-950 font-medium py-3.5 flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors text-sm"
          >
            <span>Sign in to {role === 'admin' ? 'Admin Dashboard' : 'Customer Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="text-center pt-6 text-xs text-slate-400 border-t border-white/10">
          <span className="block pt-6">Need a new clinic portal account? </span>
          <Link to="/contact" className="text-cyan-400 font-medium hover:underline">Contact Care Dent</Link>
        </div>

      </div>
    </div>
  );
}