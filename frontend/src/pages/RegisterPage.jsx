import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Globe, Eye, EyeOff, MapPin, Camera, Users } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', role: 'TRAVELER' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (val) => /^[6-9]\d{9}$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone) { setPhoneError('Phone number is required'); return; }
    if (!validatePhone(form.phone)) { setPhoneError('Enter a valid 10-digit mobile number'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to LocalLens 🌍');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      <img
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-slate-950/55 to-slate-900/70" />
      <div className="relative w-full max-w-6xl grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
        <div className="hidden lg:block text-white">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-9 h-9 text-emerald-300" />
            <span className="text-3xl font-bold">LocalLens</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight max-w-xl">Start planning trips that feel personal</h1>
          <p className="text-white/80 mt-4 max-w-lg text-lg">Join as a traveller to find memorable experiences, or become a guide and turn your local knowledge into bookable tours.</p>
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-xl">
            {[
              { icon: MapPin, label: 'Explore', value: 'Find local routes' },
              { icon: Users, label: 'Connect', value: 'Chat with guides' },
              { icon: Camera, label: 'Capture', value: 'Share reels' },
            ].map(item => (
              <div key={item.label} className="bg-white/12 backdrop-blur rounded-xl p-4 border border-white/15">
                <item.icon className="w-5 h-5 text-emerald-300 mb-3" />
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-white/70 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-8 lg:ml-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="w-7 h-7 text-green-600" />
            <span className="text-xl font-bold text-green-600">LocalLens</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" className="input-field" placeholder="Your full name"
              value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" className={`input-field ${phoneError ? 'border-red-400 focus:ring-red-300' : ''}`}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setPhoneError(''); }}
              required />
            {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} className="input-field pr-10"
                placeholder="Min 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'TRAVELER', label: '🧳 Traveller', desc: 'Explore & book guides' },
                { value: 'GUIDE', label: '🗺️ Guide', desc: 'Offer local tours' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                  className={`p-3 rounded-xl border-2 text-left transition ${form.role === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
