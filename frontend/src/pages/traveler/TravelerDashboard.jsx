import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingApi, guideApi, notificationApi, reviewApi } from '../../lib/api';
import { MapPin, Star, Calendar, Clock, TrendingUp, Award, Compass, Users, Film, X, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { getLocationImages, nearestKnownCity } from '../../lib/locationImages';

export default function TravelerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [guides, setGuides] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [dashboardCity, setDashboardCity] = useState(null);

  useEffect(() => {
    Promise.all([
      bookingApi.getMyBookings({ role: 'traveler' }).catch(() => ({ bookings: [] })),
      guideApi.search({ limit: 6 }).catch(() => ({ guides: [] })),
      notificationApi.getAll().catch(() => ({ notifications: [] })),
      reviewApi.pending().catch(() => ({ bookings: [] })),
    ]).then(([b, g, n, r]) => {
      setBookings(b.bookings || []);
      setGuides(g.guides || []);
      if (g.guides?.[0]?.city) setDashboardCity(g.guides[0].city);
      setNotifications(n.notifications?.slice(0, 5) || []);
      const reviewsDue = r.bookings || [];
      setPendingReviews(reviewsDue);
      if (reviewsDue.length) setReviewBooking(reviewsDue[0]);
      setLoading(false);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDashboardCity(nearestKnownCity(coords));
          guideApi.search({ limit: 6, lat: coords.lat, lng: coords.lng })
            .then(g => {
              setGuides(g.guides || []);
              if (g.guides?.[0]?.city) setDashboardCity(g.guides[0].city);
            })
            .catch(() => {});
        },
        () => {},
        { enableHighAccuracy: false, timeout: 1500, maximumAge: 300000 }
      );
    }
  }, []);

  const upcomingBookings = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await bookingApi.cancel(bookingId);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      toast.success('Booking cancelled', 'Refund added to your wallet if applicable');
    } catch (err) { toast.error(err.message); }
    finally { setCancellingId(null); setShowCancelConfirm(null); }
  };

  const downloadItinerary = (b) => {
    const guideName = b.guide?.fullName || 'Your Guide';
    const content = `<html><head><title>LocalLens Itinerary</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}.header{background:#22c55e;color:white;padding:20px;border-radius:8px;margin-bottom:24px}.header h1{margin:0;font-size:24px}.section{margin-bottom:20px}.section h3{color:#16a34a;border-bottom:1px solid #e5e7eb;padding-bottom:6px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6}.label{color:#6b7280;font-size:13px}.value{font-weight:600;font-size:13px}.footer{margin-top:40px;text-align:center;color:#9ca3af;font-size:12px}</style></head><body><div class="header"><h1>🌍 LocalLens Tour Itinerary</h1><p>Booking confirmed — have a great trip!</p></div><div class="section"><h3>Booking Details</h3><div class="row"><span class="label">Booking ID</span><span class="value">#${b.id.slice(0,8).toUpperCase()}</span></div><div class="row"><span class="label">Tour Date</span><span class="value">${new Date(b.date).toDateString()}</span></div><div class="row"><span class="label">Start Time</span><span class="value">${b.startTime||'TBD'}</span></div><div class="row"><span class="label">Duration</span><span class="value">${(b.duration||'').replace(/_/g,' ')}</span></div></div><div class="section"><h3>Guide Information</h3><div class="row"><span class="label">Guide Name</span><span class="value">${guideName}</span></div></div><div class="section"><h3>Meetup Details</h3><div class="row"><span class="label">Meetup Point</span><span class="value">${b.meetupLocation||'To be confirmed'}</span></div><div class="row"><span class="label">People</span><span class="value">${b.numberOfPeople||1}</span></div></div><div class="section"><h3>Payment Summary</h3><div class="row"><span class="label">Total</span><span class="value">₹${b.totalAmount}</span></div><div class="row"><span class="label">Status</span><span class="value">${b.paymentStatus||'PENDING'}</span></div></div><div class="footer">Generated by LocalLens • Have a wonderful journey! 🌏</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(content); win.document.close(); win.print(); }
  };

  const handleSOS = (b) => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await import('../../lib/api').then(({ api }) => api.post('/sos', { latitude: pos.coords.latitude, longitude: pos.coords.longitude, bookingId: b.id, message: 'Traveler triggered SOS alert' }));
        toast.error('SOS Sent! 🆘', 'Your guide has been alerted. Stay safe.');
      } catch { toast.error('SOS failed', 'Please call emergency services directly'); }
    }, () => toast.error('Location required for SOS'));
  };

  const submitReview = async () => {
    if (!reviewBooking) return;
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a short review');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewApi.submit({
        bookingId: reviewBooking.id,
        revieweeId: reviewBooking.guideId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      toast.success('Review posted', 'Thanks for helping other travellers choose confidently');
      const remaining = pendingReviews.filter(b => b.id !== reviewBooking.id);
      setPendingReviews(remaining);
      setReviewBooking(remaining[0] || null);
      setReviewForm({ rating: 5, comment: '' });
      setShowReport(false);
      setReportReason('');
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitReport = async () => {
    if (!reviewBooking || submittingReport) return;
    setSubmittingReport(true);
    try {
      await reviewApi.report({
        bookingId: reviewBooking.id,
        reason: reportReason.trim() || 'Reported from completed-trip review popup',
      });
      toast.warning('Report submitted', 'This guide account, email, and mobile number are blocked.');
      const remaining = pendingReviews.filter(b => b.id !== reviewBooking.id);
      setPendingReviews(remaining);
      setReviewBooking(remaining[0] || null);
      setReportReason('');
      setShowReport(false);
    } catch (err) {
      toast.error(err.message || 'Could not submit report');
    } finally {
      setSubmittingReport(false);
    }
  };
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const dashboardImages = getLocationImages(dashboardCity);

  if (loading) return <Layout><div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"/></div></Layout>;

  return (
    <Layout>
      <div className="dashboard-shell">
        <div className="dashboard-inner space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[1.75rem] text-white min-h-[340px] reveal-up">
        <img
          src={dashboardImages.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/66 to-sky-700/28" />
        <div className="hero-orb -left-16 -top-16 h-52 w-52 bg-sky-300/32" />
        <div className="hero-orb right-12 bottom-8 h-44 w-44 bg-indigo-300/24" style={{ animationDelay: '1.4s' }} />
        <div className="relative grid min-h-[340px] items-center gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8 lg:p-10">
          <div className="max-w-2xl">
            <span className="modern-pill mb-4"><Compass className="h-3.5 w-3.5" /> LocalLens travel studio</span>
            <h1 className="mb-3 text-3xl font-black leading-tight md:text-5xl">Welcome back, {user?.fullName?.split(' ')[0]}.</h1>
            <p className="max-w-xl text-sm leading-6 text-white/85 md:text-base">Discover local guides, hidden streets, food trails, and memorable routes with a dashboard that keeps every next step close.</p>
            <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-sky-700 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-sky-50">
              Explore Guides
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/map" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25">
              <MapPin className="h-4 w-4" />
              View Map
            </Link>
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-3 md:grid">
            <div className="image-chip h-48 translate-y-6">
              <img src={dashboardImages.tile} alt="" />
            </div>
            <div className="space-y-3">
              <div className="image-chip h-28">
                <img src={getLocationImages(guides[1]?.city || dashboardCity).tile} alt="" />
              </div>
              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold">Verified local experts</p>
                <p className="mt-1 text-xs text-white/75">Plan, book, chat, and travel with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-sky-600 bg-sky-50', image: dashboardImages.hero },
          { label: 'Completed Tours', value: completedBookings.length, icon: Award, color: 'text-sky-600 bg-sky-50', image: getLocationImages(guides[0]?.city || dashboardCity).tile },
          { label: 'Upcoming', value: upcomingBookings.length, icon: Clock, color: 'text-orange-600 bg-orange-50', image: getLocationImages(guides[1]?.city || dashboardCity).hero },
          { label: 'Loyalty Points', value: (user?.travelerProfile?.loyaltyPoints || 0), icon: TrendingUp, color: 'text-fuchsia-600 bg-fuchsia-50', image: getLocationImages(guides[2]?.city || dashboardCity).tile },
        ].map((stat, index) => (
          <div key={stat.label} className="dashboard-card group relative p-4 reveal-up" style={{ animationDelay: `${index * 90}ms` }}>
            <img src={stat.image} alt="" className="absolute inset-x-0 top-0 h-16 w-full object-cover opacity-20 transition duration-500 group-hover:opacity-30" />
            <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color} mb-4 shadow-sm`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="relative text-2xl font-black text-slate-950">{stat.value}</p>
            <p className="relative text-xs font-medium text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Links */}
        <div className="md:col-span-1">
          <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/explore', icon: Compass, label: 'Find Guides', desc: 'Browse local experts', color: 'text-sky-600' },
              { to: '/group-tours', icon: Users, label: 'Group Tours', desc: 'Join group experiences', color: 'text-blue-600' },
              { to: '/reels', icon: Film, label: 'Travel Reels', desc: 'Watch & share videos', color: 'text-pink-600' },
              { to: '/map', icon: MapPin, label: 'Live Map', desc: 'See guides near you', color: 'text-orange-600' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="dashboard-card p-3 flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white to-sky-50 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Upcoming Tours</h2>
            <Link to="/messages" className="text-xs text-sky-600 hover:underline">View all</Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="dashboard-card p-6 text-center text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No upcoming tours</p>
              <Link to="/explore" className="text-sky-600 text-sm hover:underline mt-1 block">Book one now →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingBookings.slice(0, 4).map(b => (
                <div key={b.id} className="dashboard-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {b.guide?.avatarUrl ? (
                        <img src={b.guide.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                          {b.guide?.fullName?.[0]}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{b.guide?.fullName}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{b.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(b.date), 'MMM d, yyyy')} • {b.startTime} • {b.duration.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">₹{b.totalAmount?.toFixed(0)}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {b.status === 'CONFIRMED' && (
                      <button onClick={() => downloadItinerary(b)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">📄 Itinerary</button>
                    )}
                    {['PENDING','CONFIRMED'].includes(b.status) && (
                      showCancelConfirm === b.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            {cancellingId === b.id ? '...' : 'Yes, Cancel'}
                          </button>
                          <button onClick={() => setShowCancelConfirm(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">Keep</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowCancelConfirm(b.id)} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">Cancel</button>
                      )
                    )}
                    {b.status === 'CONFIRMED' && new Date(b.date).toDateString() === new Date().toDateString() && (
                      <button onClick={() => handleSOS(b)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">🆘 SOS</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Notifications</h2>
            <Link to="/notifications" className="text-xs text-sky-600 hover:underline">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="dashboard-card p-6 text-center text-gray-500">
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className={`dashboard-card p-3 ${!n.isRead ? 'border-l-4 border-l-sky-500' : ''}`}>
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Guides */}
      {guides.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Featured Guides</h2>
            <Link to="/explore" className="text-xs text-sky-600 hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {guides.slice(0, 6).map(g => (
              <Link key={g.id} to={`/guides/${g.id}`} className="dashboard-card p-4 group">
                <div className="-mx-4 -mt-4 mb-3 h-24 overflow-hidden">
                  <img src={g.coverImage || getLocationImages(g.city).hero} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" alt="" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  {g.user?.avatarUrl ? (
                    <img src={g.user.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-700">
                      {g.user?.fullName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">{g.user?.fullName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{g.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-3 h-3 fill-current" /> {g.avgRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sky-600 font-medium">₹{g.hourlyRate}/hr</span>
                </div>
                {g.expertiseTags?.slice(0, 2).map(tag => (
                  <span key={tag} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 mr-1">{tag}</span>
                ))}
                {g.distance != null && (
                  <p className="mt-2 text-xs font-semibold text-sky-600">{g.distance} km away</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>

      {reviewBooking && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="relative h-28 bg-gradient-to-r from-sky-700 to-indigo-500">
              <button onClick={() => { setReviewBooking(null); setShowReport(false); setReportReason(''); }} className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute left-5 bottom-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/80">Tour completed</p>
                <h3 className="text-xl font-bold">How was your experience?</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                {reviewBooking.guide?.avatarUrl ? (
                  <img src={reviewBooking.guide.avatarUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    {reviewBooking.guide?.fullName?.[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{reviewBooking.guide?.fullName || 'Your guide'}</p>
                  <p className="text-xs text-gray-500">{reviewBooking.date && format(new Date(reviewBooking.date), 'MMM d, yyyy')} · {reviewBooking.duration?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map(value => (
                  <button key={value} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: value }))} className="p-1">
                    <Star className={`w-8 h-8 ${value <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>

              <textarea
                className="input-field min-h-[110px] resize-none"
                placeholder="Share what stood out: route, local knowledge, safety, friendliness..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              />

              {showReport && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                  <div className="mb-2 flex items-start gap-2 text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-xs font-medium">Reporting suspends this guide and blocks their email and mobile number from future signups.</p>
                  </div>
                  <textarea
                    className="input-field min-h-[78px] resize-none text-sm"
                    placeholder="Reason for report..."
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    if (showReport) {
                      setShowReport(false);
                      setReportReason('');
                    } else {
                      setReviewBooking(null);
                    }
                  }}
                  className="flex-1 btn-secondary"
                >
                  {showReport ? 'Cancel' : 'Later'}
                </button>
                <button onClick={submitReview} disabled={submittingReview} className="flex-1 btn-primary">
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
              <button
                onClick={showReport ? submitReport : () => setShowReport(true)}
                disabled={submittingReport}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <AlertTriangle className="h-4 w-4" />
                {showReport ? (submittingReport ? 'Reporting...' : 'Submit Report') : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
