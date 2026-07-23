const express = require('express');
const router = express.Router();
const { reviews, bookings, guideProfiles, notifications, users, blockedIdentifiers, tripReports } = require('../db');
const { protect } = require('../middleware/error.middleware');

// GET /api/reviews/pending - completed traveller bookings without a review
router.get('/pending', protect, async (req, res) => {
  try {
    const completed = await bookings.findMany({ travelerId: req.user.id, status: 'COMPLETED' });
    const pending = [];
    for (const booking of completed) {
      const existing = await reviews.findByBookingId(booking.id);
      const reported = await tripReports.findByBookingId(booking.id);
      if (!existing && !reported) pending.push(booking);
    }
    res.json({ bookings: pending });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, revieweeId, rating, comment } = req.body;
    if (!bookingId || !revieweeId || !rating) return res.status(400).json({ error: 'bookingId, revieweeId and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const booking = await bookings.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'COMPLETED') return res.status(400).json({ error: 'Can only review completed tours' });
    if (booking.travelerId !== req.user.id) return res.status(403).json({ error: 'Only traveller can submit review' });
    const review = await reviews.create({ bookingId, reviewerId: req.user.id, revieweeId, rating: parseFloat(rating), comment: comment || '' });
    await notifications.create({ userId: revieweeId, title: '⭐ New Review!', body: `${req.user.fullName} gave you ${rating} stars`, type: 'REVIEW' });
    res.status(201).json({ review });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/reviews/guide/:guideUserId
router.get('/guide/:guideUserId', async (req, res) => {
  try {
    const allReviews = await reviews.findByReviewee(req.params.guideUserId);
    res.json({ reviews: allReviews, total: allReviews.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/reviews/:id/response — guide replies
// POST /api/reviews/report - report a completed guide trip and block that guide's identifiers
router.post('/report', protect, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

    const booking = await bookings.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'COMPLETED') return res.status(400).json({ error: 'Can only report completed tours' });
    if (booking.travelerId !== req.user.id) return res.status(403).json({ error: 'Only the traveller can report this trip' });

    const reportedUser = await users.findById(booking.guideId);
    if (!reportedUser) return res.status(404).json({ error: 'Guide not found' });

    const report = await tripReports.create({
      bookingId,
      reporterId: req.user.id,
      reportedUserId: reportedUser.id,
      reason: reason || 'Reported from completed-trip review popup',
    });

    const guideProfile = await guideProfiles.findByUserId(reportedUser.id).catch(() => null);
    if (guideProfile) await guideProfiles.update(guideProfile.id, { isBlacklisted: true, isAvailable: false });
    await users.update(reportedUser.id, { isActive: false });
    const blocked = await blockedIdentifiers.blockUser(reportedUser, {
      reportedBy: req.user.id,
      bookingId,
      reason: reason || 'Reported from completed-trip review popup',
    });

    await notifications.create({
      userId: reportedUser.id,
      title: 'Account Suspended',
      body: 'Your account has been reported after a completed trip and suspended pending review.',
      type: 'GENERAL',
      data: { bookingId, reportId: report.id },
    });

    console.log(`REPORT: User ${reportedUser.id} blocked by ${req.user.id}. Booking: ${bookingId}. Reason: ${reason || ''}`);
    res.json({ message: 'Report submitted. This guide account, email, and mobile number are now blocked.', report, blockedCount: blocked.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/response', protect, async (req, res) => {
  try {
    const { response } = req.body;
    const { USE_PG } = require('../db');
    if (USE_PG) {
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      const r = await pool.query('UPDATE reviews SET guide_response=$1 WHERE id=$2 AND reviewee_id=$3 RETURNING *', [response, req.params.id, req.user.id]);
      await pool.end();
      if (!r.rows[0]) return res.status(404).json({ error: 'Review not found or access denied' });
      return res.json({ review: r.rows[0] });
    }
    const path = require('path'), fs = require('fs');
    const file = path.join(__dirname, '../../data/reviews.json');
    const store = JSON.parse(fs.readFileSync(file, 'utf8'));
    const idx = store.findIndex(r => r.id === req.params.id && r.revieweeId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found' });
    store[idx].guideResponse = response;
    fs.writeFileSync(file, JSON.stringify(store, null, 2));
    res.json({ review: store[idx] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/reviews/blacklist/:guideUserId — traveller blacklists a scammer guide
router.post('/blacklist/:guideUserId', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const targetGuide = await guideProfiles.findByUserId(req.params.guideUserId);
    if (!targetGuide) return res.status(404).json({ error: 'Guide not found' });

    // Mark guide as blacklisted
    await guideProfiles.update(targetGuide.id, { isBlacklisted: true, isAvailable: false });
    const targetUser = await users.findById(req.params.guideUserId);
    await users.update(req.params.guideUserId, { isActive: false });
    await blockedIdentifiers.blockUser(targetUser, {
      reportedBy: req.user.id,
      reason: reason || 'Blacklisted by traveller',
    });

    // Notify admins (log for now)
    console.log(`⚠️ BLACKLIST: Guide ${req.params.guideUserId} blacklisted by ${req.user.id}. Reason: ${reason}`);

    // Notify the guide
    await notifications.create({
      userId: req.params.guideUserId,
      title: '⛔ Account Suspended',
      body: `Your account has been reported and suspended. Contact support to appeal.`,
      type: 'GENERAL',
    });

    res.json({ message: 'Guide has been blacklisted and their account suspended.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.patch('/:id/respond', protect, async (req, res) => {
  try {
    const { response } = req.body;
    if (!response?.trim()) return res.status(400).json({ error: 'Response text required' });
    if (require('../db').USE_PG) {
      const { query } = require('../db');
      const rows = await query('SELECT * FROM reviews WHERE id=$1', [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
      if (rows[0].reviewee_id !== req.user.id) return res.status(403).json({ error: 'Only the reviewed guide can respond' });
      await query('UPDATE reviews SET guide_response=$1, responded_at=NOW() WHERE id=$2', [response.trim(), req.params.id]);
      await notifications.create({ userId: rows[0].reviewer_id, title: 'Guide replied to your review', body: `${req.user.fullName} responded to your review`, type: 'REVIEW', data: { reviewId: req.params.id } });
      return res.json({ message: 'Response saved' });
    }
    const { reviews: rv } = require('../db');
    const review = await rv.findById ? await rv.findById(req.params.id) : null;
    if (review) await rv.update?.(req.params.id, { guideResponse: response.trim() });
    res.json({ message: 'Response saved' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
