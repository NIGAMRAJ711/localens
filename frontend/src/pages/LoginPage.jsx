import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Globe, Eye, EyeOff, MapPin, Star, Compass } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName?.split(' ')[0]}! 👋`);
      if (user.role === 'GUIDE') navigate('/guide-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.35),transparent_34rem),radial-gradient(circle_at_85%_15%,rgba(249,115,22,0.22),transparent_24rem),linear-gradient(135deg,#020617_0%,#0f172a_48%,#064e3b_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="relative w-full max-w-6xl grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
        <div className="hidden lg:block text-white">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-9 h-9 text-emerald-300" />
            <span className="text-3xl font-bold">LocalLens</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight max-w-xl">Travel deeper with trusted local guides</h1>
          <p className="text-white/80 mt-4 max-w-lg text-lg">Book authentic city walks, hidden places, food trails, and photo-friendly routes planned by people who know the streets.</p>
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-xl">
            {[
              { icon: MapPin, label: 'Live map', value: 'Nearby guides' },
              { icon: Star, label: 'Reviews', value: 'Real travellers' },
              { icon: Compass, label: 'Tours', value: 'Local routes' },
            ].map(item => (
              <div key={item.label} className="bg-white/12 backdrop-blur rounded-xl p-4 border border-white/15">
                <item.icon className="w-5 h-5 text-emerald-300 mb-3" />
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-white/70 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-8 ml-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">LocalLens</span>
          </div>
          <p className="text-gray-500 text-sm">Discover local guides & hidden gems</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} className="input-field pr-10"
                placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">Forgot password?</Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-medium hover:underline">Sign up</Link>
        </p>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-medium text-gray-600 mb-1">Demo accounts:</p>
          <p>Guide: arjun@guide.com / Guide@1234</p>
          <p>Traveller: rohan@traveller.com / Travel@1234</p>
        </div>
      </div>
      </div>
    </div>
  );
}
