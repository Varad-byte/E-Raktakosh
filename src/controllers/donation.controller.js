/**
 * Donation Controller
 * Handles donor collection history logs.
 */

const { db } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const donationController = {
  // GET /api/donations
  getAll(req, res, next) {
    try {
      const rows = db.prepare('SELECT id, donorId, donorName, bloodGroup, units, donationDate, status FROM donations ORDER BY rowid DESC').all();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/donations/:id
  getById(req, res, next) {
    try {
      const { id } = req.params;
      const donation = db.prepare('SELECT id, donorId, donorName, bloodGroup, units, donationDate, status FROM donations WHERE id = ?').get(id);
      if (!donation) {
        throw ApiError.notFound(`Donation record with ID '${id}' not found`);
      }
      res.json(donation);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/donations
  create(req, res, next) {
    try {
      let { id, donorId, donorName, bloodGroup, units, donationDate, status } = req.body;

      if (!id) {
        const rand = Math.floor(200 + Math.random() * 800);
        id = `DON-${rand}`;
      }

      const stmt = db.prepare(`
        INSERT INTO donations (id, donorId, donorName, bloodGroup, units, donationDate, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run(
        id,
        donorId || '',
        donorName.trim(),
        bloodGroup,
        Number(units) || 1,
        donationDate || new Date().toISOString().split('T')[0],
        status || 'Completed'
      );

      const created = db.prepare('SELECT id, donorId, donorName, bloodGroup, units, donationDate, status FROM donations WHERE id = ?').get(id);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/donations/:id
  delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM donations WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Donation record with ID '${id}' not found`);
      }

      db.prepare('DELETE FROM donations WHERE id = ?').run(id);
      res.json({ success: true, message: `Donation ${id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = donationController;
