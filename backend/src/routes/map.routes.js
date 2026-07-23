const express = require('express');
const router = express.Router();
const { guideProfiles, hiddenGems, USE_PG, query } = require('../db');

const CITY_COORDS = {
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  kochi: [9.9312, 76.2673],
  goa: [15.2993, 74.1240],
  varanasi: [25.3176, 82.9739],
  agra: [27.1767, 78.0081],
  amritsar: [31.6340, 74.8723],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],
  udaipur: [24.5854, 73.7125],
  rishikesh: [30.0869, 78.2676],
  shimla: [31.1048, 77.1734],
  manali: [32.2432, 77.1892],
  davangere: [14.4644, 75.9218],
  hubli: [15.3647, 75.1240],
  coimbatore: [11.0168, 76.9558],
};

function fallbackCoordsForGuide(guide) {
  const cityKey = guide.city?.toLowerCase().trim();
  const base = CITY_COORDS[cityKey] || [20.5937, 78.9629];
  const seed = String(guide.id || guide.user_id || guide.userId || '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return {
    latitude: base[0] + ((seed % 17) - 8) * 0.006,
    longitude: base[1] + (((seed * 7) % 17) - 8) * 0.006,
    approximateLocation: true,
  };
}

function withMapCoords(guide) {
  const latitude = parseFloat(guide.latitude);
  const longitude = parseFloat(guide.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { ...guide, latitude, longitude, approximateLocation: false };
  }
  return { ...guide, ...fallbackCoordsForGuide(guide) };
}

// GET /map/guides — full data for map pins
router.get('/guides', async (req, res) => {
  try {
    if (USE_PG) {
      const { city } = req.query;
      let sql = `
        SELECT
          gp.id, gp.user_id, gp.latitude, gp.longitude, gp.city, gp.country,
          gp.hourly_rate, gp.half_day_rate, gp.full_day_rate,
          gp.avg_rating, gp.total_reviews, gp.total_bookings,
          gp.is_available, gp.expertise_tags, gp.languages,
          gp.verification_status, gp.is_blacklisted,
          u.full_name, u.avatar_url
        FROM guide_profiles gp
        JOIN users u ON u.id = gp.user_id
        WHERE COALESCE(gp.is_blacklisted, false) = false
      `;
      const params = [];
      if (city) { sql += ` AND LOWER(gp.city) LIKE LOWER($1)`; params.push(`%${city}%`); }
      sql += ' ORDER BY gp.avg_rating DESC LIMIT 500';
      const rows = await query(sql, params);
      const guides = rows.map(r => withMapCoords({
        id: r.id,
        userId: r.user_id,
        latitude: r.latitude,
        longitude: r.longitude,
        city: r.city,
        country: r.country,
        hourlyRate: parseFloat(r.hourly_rate) || 0,
        halfDayRate: parseFloat(r.half_day_rate) || 0,
        fullDayRate: parseFloat(r.full_day_rate) || 0,
        avgRating: parseFloat(r.avg_rating) || 0,
        totalReviews: r.total_reviews || 0,
        totalBookings: r.total_bookings || 0,
        isAvailable: r.is_available,
        expertiseTags: r.expertise_tags || [],
        languages: r.languages || [],
        verificationStatus: r.verification_status,
        user: { id: r.user_id, fullName: r.full_name, avatarUrl: r.avatar_url },
      }));
      return res.json({ guides });
    }
    // JSON mode — use existing findMany which already enriches
    const guides = await guideProfiles.findMany({ ...req.query, limit: 500 });
    const filtered = guides.filter(g => !g.isBlacklisted).map(withMapCoords);
    res.json({ guides: filtered });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /map/hidden-gems — with guide name
router.get('/hidden-gems', async (req, res) => {
  try {
    if (USE_PG) {
      const { city } = req.query;
      let sql = `
        SELECT hg.*, u.full_name as guide_name
        FROM hidden_gems hg
        JOIN guide_profiles gp ON gp.id = hg.guide_id
        JOIN users u ON u.id = gp.user_id
        WHERE 1=1
      `;
      const params = [];
      if (city) { sql += ` AND LOWER(hg.city) LIKE LOWER($1)`; params.push(`%${city}%`); }
      const rows = await query(sql, params);
      const gems = rows.map(r => ({
        id: r.id,
        guideId: r.guide_id,
        name: r.name,
        description: r.description,
        category: r.category,
        city: r.city,
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
        isLocked: r.is_locked,
        photos: r.photos || [],
        guideName: r.guide_name,
        createdAt: r.created_at,
      }));
      return res.json({ gems });
    }
    const gems = await hiddenGems.findMany(req.query);
    res.json({ gems });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
