/**
 * Settings Controller
 * Handles facility configuration and stock alert thresholds.
 */

const { db } = require('../config/db');

const settingsController = {
  // GET /api/settings
  getSettings(req, res, next) {
    try {
      const row = db.prepare(`
        SELECT lowStockThreshold, nearExpiryDaysThreshold, facilityName, licenseNumber, nodalOfficer, contactPhone 
        FROM settings 
        WHERE id = 1
      `).get();

      if (!row) {
        // Fallback default
        return res.json({
          lowStockThreshold: 5,
          nearExpiryDaysThreshold: 7,
          facilityName: 'Central Regional Blood Centre (e-RaktKosh Partner)',
          licenseNumber: 'DL-BB-2024-0981',
          nodalOfficer: 'Dr. Amit Roy',
          contactPhone: '+91 11 2345 6789'
        });
      }

      res.json(row);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/settings and PUT /api/settings
  saveSettings(req, res, next) {
    try {
      const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {};
      const {
        lowStockThreshold,
        nearExpiryDaysThreshold,
        facilityName,
        licenseNumber,
        nodalOfficer,
        contactPhone
      } = req.body;

      const newLowStock = lowStockThreshold !== undefined ? Number(lowStockThreshold) : (existing.lowStockThreshold || 5);
      const newNearExpiry = nearExpiryDaysThreshold !== undefined ? Number(nearExpiryDaysThreshold) : (existing.nearExpiryDaysThreshold || 7);
      const newFacility = facilityName !== undefined ? facilityName.trim() : (existing.facilityName || 'Central Regional Blood Centre');
      const newLicense = licenseNumber !== undefined ? licenseNumber.trim() : (existing.licenseNumber || '');
      const newOfficer = nodalOfficer !== undefined ? nodalOfficer.trim() : (existing.nodalOfficer || '');
      const newPhone = contactPhone !== undefined ? contactPhone.trim() : (existing.contactPhone || '');

      const stmt = db.prepare(`
        INSERT INTO settings (id, lowStockThreshold, nearExpiryDaysThreshold, facilityName, licenseNumber, nodalOfficer, contactPhone, updatedAt)
        VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          lowStockThreshold = excluded.lowStockThreshold,
          nearExpiryDaysThreshold = excluded.nearExpiryDaysThreshold,
          facilityName = excluded.facilityName,
          licenseNumber = excluded.licenseNumber,
          nodalOfficer = excluded.nodalOfficer,
          contactPhone = excluded.contactPhone,
          updatedAt = datetime('now')
      `);

      stmt.run(newLowStock, newNearExpiry, newFacility, newLicense, newOfficer, newPhone);

      const updated = db.prepare(`
        SELECT lowStockThreshold, nearExpiryDaysThreshold, facilityName, licenseNumber, nodalOfficer, contactPhone 
        FROM settings 
        WHERE id = 1
      `).get();

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = settingsController;
