/**
 * Inventory Controller
 * Handles blood batch operations.
 */

const { db } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const inventoryController = {
  // GET /api/inventory
  getAll(req, res, next) {
    try {
      const rows = db.prepare('SELECT id, bloodGroup, units, collectionDate, expiryDate, donorId, notes FROM inventory ORDER BY rowid DESC').all();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/inventory/:id
  getById(req, res, next) {
    try {
      const { id } = req.params;
      const batch = db.prepare('SELECT id, bloodGroup, units, collectionDate, expiryDate, donorId, notes FROM inventory WHERE id = ?').get(id);
      if (!batch) {
        throw ApiError.notFound(`Inventory batch with ID '${id}' not found`);
      }
      res.json(batch);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/inventory
  create(req, res, next) {
    try {
      let { id, bloodGroup, units, collectionDate, expiryDate, donorId, notes } = req.body;
      
      // Auto-generate realistic ID if not provided
      if (!id) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        id = `BAT-${rand}`;
      }

      const stmt = db.prepare(`
        INSERT INTO inventory (id, bloodGroup, units, collectionDate, expiryDate, donorId, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run(
        id,
        bloodGroup,
        Number(units) || 0,
        collectionDate,
        expiryDate,
        donorId || '',
        notes || ''
      );

      const created = db.prepare('SELECT id, bloodGroup, units, collectionDate, expiryDate, donorId, notes FROM inventory WHERE id = ?').get(id);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/inventory/:id
  update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Inventory batch with ID '${id}' not found`);
      }

      const { bloodGroup, units, collectionDate, expiryDate, donorId, notes } = req.body;

      const newBloodGroup = bloodGroup !== undefined ? bloodGroup : existing.bloodGroup;
      const newUnits = units !== undefined ? Number(units) : existing.units;
      const newCollectionDate = collectionDate !== undefined ? collectionDate : existing.collectionDate;
      const newExpiryDate = expiryDate !== undefined ? expiryDate : existing.expiryDate;
      const newDonorId = donorId !== undefined ? donorId : existing.donorId;
      const newNotes = notes !== undefined ? notes : existing.notes;

      const stmt = db.prepare(`
        UPDATE inventory 
        SET bloodGroup = ?, units = ?, collectionDate = ?, expiryDate = ?, donorId = ?, notes = ?, updatedAt = datetime('now')
        WHERE id = ?
      `);

      stmt.run(newBloodGroup, newUnits, newCollectionDate, newExpiryDate, newDonorId, newNotes, id);

      const updated = db.prepare('SELECT id, bloodGroup, units, collectionDate, expiryDate, donorId, notes FROM inventory WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/inventory/:id
  delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM inventory WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Inventory batch with ID '${id}' not found`);
      }

      db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
      res.json({ success: true, message: `Batch ${id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = inventoryController;
