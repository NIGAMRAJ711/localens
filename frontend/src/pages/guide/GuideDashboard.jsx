import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { guideApi, bookingApi, notificationApi } from '../../lib/api';
import { DollarSign, Star, Users, Calendar, MessageCircle, Bell, ToggleLeft, ToggleRight, CheckCircle, Clock, XCircle, MapPin, TrendingUp, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { getLocationImages } from '../../lib/locationImages';

function BookingDetails({ booking }) {
  const details = [
    { label: 'Tour Type', value: booking.bookingType?.replace(/_/g, ' ') },
    { label: 'Duration', value: booking.duration?.replace(/_/g, ' ') },
    { label: 'People', value: `${booking.numberOfPeople || 1} person${(booking.numberOfPeople || 1) > 1 ? 's' : ''}` },
    { label: 'Meetup', value: booking.meetupLocation },
    { label: 'Hotel / Stay', value: booking.hotelPreference },
    { label: 'Food', value: booking.restaurantPreference },
  ].filter(item => item.value);

  return (
    <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {details.map(item => (
          <div key={item.label}>
            <p className="text-gray-400">{item.label}</p>
            <p className="font-semibold text-gray-700 break-words">{item.value}</p>
          </div>
        ))}
      </div>
      {booking.specialRequests && (
        <div className="mt-2 border-t border-gray-200 pt-2">
          <p className="text-gray-400">Special Requests</p>
          <p className="font-medium text-gray-700 break-words">{booking.specialRequests}</p>
        </div>
      )}
    </div>
  );
}

export default function GuideDashboard() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, b, n] = await Promise.all([
        guideApi.getDashboardStats().catch(() => null),
        bookingApi.getMyBookings({ role: 'guide' }).catch(() => ({ bookings: [] })),
        notificationApi.getAll().catch(() => ({ notifications: [] })),
      ]);
      setStats(s);
      setBookings(b.bookings || []);
      setNotifications(n.notifications?.filter(n => !n.isRead).slice(0, 5) || []);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    setToggling(true);
    const current = stats?.stats?.isAvailable || false;
    try {
      await guideApi.updateAvailability(!current);
      setStats(s => s ? { ...s, stats: { ...s.stats, isAvailable: !current } } : s);
      toast.success(current ? 'You are now Offline' : 'You are now Online and visible to travellers! 🟢');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(false);
    }
  };

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleBookingAction = async (bookingId, status) => {
    setActionLoading(l => ({ ...l, [bookingId]: status }));
    try {
      await bookingApi.updateStatus(bookingId, status);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, status } : b));
      if (status === 'CONFIRMED') toast.success('Booking confirmed!', 'Traveller has been notified ✅');
      else toast.info('Booking declined');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(l => ({ ...l, [bookingId]: null }));
    }
  };

  const handleReject = async (bookingId) => {
    if (!rejectReason.trim()) { toast.error('Please enter a reason for rejection'); return; }
    setActionLoading(l => ({ ...l, [bookingId]: 'rejecting' }));
    try {
      await bookingApi.reject(bookingId, rejectReason);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      setRejectingId(null);
      setRejectReason('');
      toast.info('Booking rejected', 'Traveller has been notified');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(l => ({ ...l, [bookingId]: null }));
    }
  };

  const handleComplete = async (bookingId) => {
    setActionLoading(l => ({ ...l, [bookingId]: 'completing' }));
    try {
      const result = await bookingApi.complete(bookingId);
      await loadData();
      toast.success(`Tour completed! 💰 Earnings added to your wallet`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(l => ({ ...l, [bookingId]: null }));
    }
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
      </div>
    </Layout>
  );

  const isAvailable = stats?.stats?.isAvailable || false;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const guideImages = getLocationImages(user?.guideProfile?.city);

  return (
    <Layout>
      <div className="dashboard-shell">
        <div className="dashboard-inner space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[1.75rem] text-white min-h-[340px] reveal-up">
        <img
          src={guideImages.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/66 to-sky-700/24" />
        <div className="hero-orb -left-16 top-0 h-52 w-52 bg-sky-300/30" />
        <div className="hero-orb right-10 bottom-8 h-44 w-44 bg-indigo-300/24" style={{ animationDelay: '1.2s' }} />
        <div className="relative grid min-h-[340px] items-center gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8 lg:p-10">
          <div>
            <span className="modern-pill mb-4"><Compass className="h-3.5 w-3.5" /> Guide command center</span>
            <h1 className="mb-3 text-3xl font-black leading-tight md:text-5xl">Guide Dashboard</h1>
            <p className="max-w-xl text-sm leading-6 text-white/85 md:text-base">Welcome back, {user?.fullName?.split(' ')[0]}! Manage requests, tours, earnings, and availability with a sharper view of your day.</p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={toggleAvailability}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition hover:-translate-y-0.5 ${
                  isAvailable ? 'bg-white text-sky-700 hover:bg-sky-50' : 'bg-white/15 border border-white/40 text-white hover:bg-white/25'
                }`}
              >
                {toggling ? (
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : isAvailable ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                {isAvailable ? '🟢 Online' : '⚫ Offline'}
              </button>
              <Link to="/map" className="flex items-center gap-1.5 bg-white/15 border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/25 transition hover:-translate-y-0.5">
                <MapPin className="w-4 h-4" /> View Map <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/25 bg-slate-950/35 p-5 text-right shadow-lg">
            <div className="mb-3 ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-white/70 text-xs mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold">₹{stats?.stats?.walletBalance?.toFixed(0) || '0'}</p>
            <p className="text-white/70 text-xs mt-1">{stats?.stats?.totalBookings || 0} total tours</p>
          </div>
        </div>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today", value: `₹${stats?.earnings?.today?.toFixed(0) || '0'}`, icon: DollarSign, color: 'text-sky-600 bg-sky-50' },
          { label: 'This Week', value: `₹${stats?.earnings?.week?.toFixed(0) || '0'}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'This Month', value: `₹${stats?.earnings?.month?.toFixed(0) || '0'}`, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
          { label: 'All Time', value: `₹${stats?.earnings?.total?.toFixed(0) || '0'}`, icon: DollarSign, color: 'text-orange-600 bg-orange-50' },
        ].map((s, index) => (
          <div key={s.label} className="dashboard-card p-4 reveal-up" style={{ animationDelay: `${index * 90}ms` }}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.color} mb-3 shadow-sm`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-gray-900">Booking Requests</h2>
            {pendingBookings.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{pendingBookings.length}</span>
            )}
          </div>

          {pendingBookings.length === 0 ? (
            <div className="dashboard-card p-8 text-center text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="font-medium text-sm">No pending requests</p>
              <p className="text-xs mt-1">Toggle online to receive bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <div key={b.id} className="dashboard-card p-4 border-l-4 border-l-yellow-400">
                  <div className="flex items-center gap-3 mb-3">
                    {b.traveler?.avatarUrl ? (
                      <img src={b.traveler.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                        {b.traveler?.fullName?.[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{b.traveler?.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {b.date && format(new Date(b.date), 'MMM d, yyyy')} · {b.startTime} · {b.duration?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-sky-600 font-bold">₹{b.totalAmount?.toFixed(0)}</p>
                    </div>
                  </div>
                  <BookingDetails booking={b} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookingAction(b.id, 'CONFIRMED')}
                      disabled={!!actionLoading[b.id]}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50 font-medium"
                    >
                      {actionLoading[b.id] === 'CONFIRMED' ? <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle className="w-4 h-4" />}
                      Accept
                    </button>
                    <button
                      onClick={() => setRejectingId(rejectingId === b.id ? null : b.id)}
                      disabled={!!actionLoading[b.id]}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 text-sm py-2 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {actionLoading[b.id] === 'CANCELLED' ? <div className="animate-spin w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full" /> : <XCircle className="w-4 h-4" />}
                      Decline
                    </button>
                  </div>
                  {rejectingId === b.id && (
                    <div className="mt-2 flex gap-2">
                      <input className="input-field text-sm flex-1 py-1.5" placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                      <button onClick={() => handleReject(b.id)} disabled={!!actionLoading[b.id]} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg font-medium hover:bg-red-700 transition">Send</button>
                      <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg">Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed/Active Tours */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-gray-900">Upcoming Tours</h2>
            {confirmedBookings.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">{confirmedBookings.length}</span>
            )}
          </div>

          {confirmedBookings.length === 0 ? (
            <div className="dashboard-card p-8 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="font-medium text-sm">No upcoming tours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map(b => (
                <div key={b.id} className="dashboard-card p-4 border-l-4 border-l-sky-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-700">
                        {b.traveler?.fullName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{b.traveler?.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {b.date && format(new Date(b.date), 'MMM d')} · {b.startTime}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">CONFIRMED</span>
                  </div>
                  <BookingDetails booking={b} />
                  <p className="text-xs text-sky-600 font-bold mb-3">₹{b.totalAmount?.toFixed(0)}</p>
                  <div className="flex gap-2">
                    <Link to="/messages" className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-gray-200 py-2 rounded-xl hover:bg-gray-50 transition">
                      <MessageCircle className="w-3.5 h-3.5 text-gray-500" /> Chat
                    </Link>
                    <button
                      onClick={() => handleComplete(b.id)}
                      disabled={!!actionLoading[b.id]}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {actionLoading[b.id] === 'completing' ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Complete & Get Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="dashboard-card p-5">
        <h2 className="font-bold text-gray-900 mb-4">Profile Performance</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-yellow-600">⭐ {stats?.stats?.avgRating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats?.stats?.totalReviews || 0} reviews</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-sky-600">{stats?.stats?.totalBookings || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total tours done</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-blue-600">₹{stats?.earnings?.total?.toFixed(0) || '0'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lifetime earnings</p>
          </div>
        </div>
      </div>

      {/* Unread Notifications */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Notifications</h2>
            <Link to="/notifications" className="text-xs text-sky-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="dashboard-card p-3 border-l-4 border-l-sky-500">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </Layout>
  );
}
