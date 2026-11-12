/**
 * Customer & Public Portal Controller
 * Handles citizen blood requests, personal tracking, donation appointments,
 * live public inventory lookup, and voluntary blood donation camps.
 */

const { db } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const customerController = {
  // GET /api/public/inventory
  // Search live blood stock with bloodGroup and city filters
  getPublicInventory(req, res, next) {
    try {
      const { bloodGroup, city } = req.query;

      // Get facility settings info
      const facility = db.prepare('SELECT facilityName, contactPhone FROM settings WHERE id = 1').get() || {};
      const adminUser = db.prepare("SELECT city, facilityName FROM users WHERE role = 'admin' LIMIT 1").get() || {};

      const facilityName = facility.facilityName || adminUser.facilityName || 'Central Regional Blood Centre';
      const facilityCity = adminUser.city || 'New Delhi';
      const contactPhone = facility.contactPhone || '+91 11 2345 6789';

      let query = `
        SELECT id, bloodGroup, units, collectionDate, expiryDate, notes
        FROM inventory
        WHERE units > 0 AND date(expiryDate) >= date('now')
      `;
      const params = [];

      if (bloodGroup && bloodGroup.trim()) {
        query += ` AND UPPER(bloodGroup) = ?`;
        params.push(bloodGroup.trim().toUpperCase());
      }

      query += ` ORDER BY bloodGroup ASC, expiryDate ASC`;

      const batches = db.prepare(query).all(...params);

      // Check city filter
      const cityMatches = !city || city.trim() === '' || facilityCity.toLowerCase().includes(city.trim().toLowerCase());

      // Aggregate stock by blood group
      const stockSummary = {};
      const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      allGroups.forEach(bg => {
        stockSummary[bg] = { units: 0, batches: 0, status: 'Out of Stock' };
      });

      let totalUnits = 0;
      const filteredBatches = cityMatches ? batches : [];

      filteredBatches.forEach(b => {
        if (!stockSummary[b.bloodGroup]) {
          stockSummary[b.bloodGroup] = { units: 0, batches: 0, status: 'Out of Stock' };
        }
        stockSummary[b.bloodGroup].units += b.units;
        stockSummary[b.bloodGroup].batches += 1;
        totalUnits += b.units;
      });

      // Assign stock status
      Object.keys(stockSummary).forEach(bg => {
        const u = stockSummary[bg].units;
        if (u === 0) stockSummary[bg].status = 'Out of Stock';
        else if (u <= 3) stockSummary[bg].status = 'Critical';
        else if (u <= 8) stockSummary[bg].status = 'Moderate';
        else stockSummary[bg].status = 'Available';
      });

      res.json({
        success: true,
        facility: {
          name: facilityName,
          city: facilityCity,
          contactPhone: contactPhone
        },
        filtersApplied: {
          bloodGroup: bloodGroup || 'All',
          city: city || 'All'
        },
        totalUnits,
        summary: stockSummary,
        data: filteredBatches.map(b => ({
          ...b,
          facilityName: facilityName,
          city: facilityCity
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/public/camps
  // List upcoming voluntary blood donation camps
  getPublicCamps(req, res, next) {
    try {
      const { city, search } = req.query;
      let query = `
        SELECT id, campName, organizer, venue, city, campDate, campTime, contactPhone, targetUnits, registeredCount
        FROM donation_camps
        WHERE 1=1
      `;
      const params = [];

      if (city && city.trim()) {
        query += ` AND LOWER(city) LIKE ?`;
        params.push(`%${city.trim().toLowerCase()}%`);
      }

      if (search && search.trim()) {
        query += ` AND (LOWER(campName) LIKE ? OR LOWER(venue) LIKE ? OR LOWER(organizer) LIKE ?)`;
        const term = `%${search.trim().toLowerCase()}%`;
        params.push(term, term, term);
      }

      query += ` ORDER BY campDate ASC`;

      const camps = db.prepare(query).all(...params);
      res.json({
        success: true,
        count: camps.length,
        data: camps
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/customer/requests
  // Submit new emergency blood requisition by citizen
  createCustomerRequest(req, res, next) {
    try {
      const { patientName, hospitalName, bloodGroup, units, contactPhone, requestDate } = req.body;

      const errors = [];
      if (!patientName || !patientName.trim()) errors.push('patientName is required');
      if (!hospitalName || !hospitalName.trim()) errors.push('hospitalName is required');
      if (!bloodGroup || !bloodGroup.trim()) errors.push('bloodGroup is required');
      if (!units || Number(units) <= 0) errors.push('Valid number of units is required');
      if (!contactPhone || !contactPhone.trim()) errors.push('contactPhone is required');

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const rand = Math.floor(500 + Math.random() * 500);
      const requestId = `REQ-${rand}`;
      const reqDate = requestDate || new Date().toISOString().split('T')[0];

      const userId = req.user ? req.user.id : null;
      const requesterEmail = req.user ? req.user.email : (req.body.email || null);

      const stmt = db.prepare(`
        INSERT INTO requests (id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status, userId, requesterEmail, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run(
        requestId,
        patientName.trim(),
        hospitalName.trim(),
        bloodGroup.trim(),
        Number(units),
        contactPhone.trim(),
        reqDate,
        userId,
        requesterEmail
      );

      const created = db.prepare(`
        SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status, userId, requesterEmail, createdAt
        FROM requests WHERE id = ?
      `).get(requestId);

      res.status(201).json({
        success: true,
        message: 'Emergency blood requisition submitted successfully. Our team will verify and dispatch units promptly.',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/customer/requests
  // Track blood requisitions submitted by the current citizen user
  getCustomerRequests(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        throw ApiError.unauthorized('Authentication required to track personal requests');
      }

      const rows = db.prepare(`
        SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status, createdAt, updatedAt
        FROM requests
        WHERE userId = ? OR LOWER(requesterEmail) = ? OR contactPhone = ?
        ORDER BY rowid DESC
      `).all(user.id, (user.email || '').toLowerCase(), user.contactPhone || '');

      res.json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/customer/donate
  // Register voluntary blood donor appointment / camp RSVP
  registerDonationAppointment(req, res, next) {
    try {
      const {
        campId,
        campName,
        appointmentDate,
        preferredSlot,
        donorName,
        contactPhone,
        email,
        bloodGroup,
        city
      } = req.body;

      const user = req.user || null;
      const resolvedName = donorName || (user ? (user.fullName || user.nodalOfficer) : null);
      const resolvedPhone = contactPhone || (user ? user.contactPhone : null);
      const resolvedEmail = email || (user ? user.email : null);
      const resolvedGroup = bloodGroup || (user ? user.bloodGroup : null);

      const errors = [];
      if (!resolvedName || !resolvedName.trim()) errors.push('donorName is required');
      if (!resolvedPhone || !resolvedPhone.trim()) errors.push('contactPhone is required');
      if (!appointmentDate || !appointmentDate.trim()) errors.push('appointmentDate is required');

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const rand = Math.floor(100 + Math.random() * 900);
      const apptId = `APT-${rand}`;

      let resolvedCampName = campName;
      if (campId) {
        const camp = db.prepare('SELECT campName FROM donation_camps WHERE id = ?').get(campId);
        if (camp) {
          resolvedCampName = camp.campName;
          // Increment camp RSVP count
          db.prepare('UPDATE donation_camps SET registeredCount = registeredCount + 1 WHERE id = ?').run(campId);
        }
      }

      const stmt = db.prepare(`
        INSERT INTO donor_appointments 
        (id, userId, donorName, contactPhone, email, bloodGroup, campId, campName, appointmentDate, preferredSlot, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', datetime('now'))
      `);

      stmt.run(
        apptId,
        user ? user.id : null,
        resolvedName.trim(),
        resolvedPhone.trim(),
        resolvedEmail ? resolvedEmail.trim() : null,
        resolvedGroup ? resolvedGroup.trim() : 'Unknown',
        campId || null,
        resolvedCampName || 'Central Blood Centre Facility',
        appointmentDate.trim(),
        preferredSlot ? preferredSlot.trim() : 'Morning (09:00 AM - 12:00 PM)'
      );

      // Also ensure donor is registered in the donors directory
      if (resolvedName && resolvedGroup) {
        const existingDonor = db.prepare('SELECT id FROM donors WHERE contactPhone = ?').get(resolvedPhone.trim());
        if (!existingDonor) {
          const donorId = `DNR-${Math.floor(200 + Math.random() * 800)}`;
          db.prepare(`
            INSERT INTO donors (id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).run(
            donorId,
            resolvedName.trim(),
            user && user.age ? user.age : 25,
            user && user.gender ? user.gender : 'Unspecified',
            resolvedGroup.trim(),
            resolvedPhone.trim(),
            city || (user && user.city ? user.city : 'New Delhi'),
            null
          );
        }
      }

      const created = db.prepare('SELECT * FROM donor_appointments WHERE id = ?').get(apptId);

      res.status(201).json({
        success: true,
        message: 'Thank you for pledging to donate blood! Your appointment has been confirmed.',
        data: created
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = customerController;
