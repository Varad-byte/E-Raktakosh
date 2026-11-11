/**
 * Blood Request Controller
 * Handles hospital requisitions and status workflow (Pending, Approved, Fulfilled, Rejected).
 */

const { db } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const requestController = {
  // GET /api/requests
  getAll(req, res, next) {
    try {
      const rows = db.prepare('SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status FROM requests ORDER BY rowid DESC').all();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/requests/:id
  getById(req, res, next) {
    try {
      const { id } = req.params;
      const request = db.prepare('SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status FROM requests WHERE id = ?').get(id);
      if (!request) {
        throw ApiError.notFound(`Blood request with ID '${id}' not found`);
      }
      res.json(request);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/requests
  create(req, res, next) {
    try {
      let { id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status } = req.body;

      if (!id) {
        const rand = Math.floor(500 + Math.random() * 500);
        id = `REQ-${rand}`;
      }

      const stmt = db.prepare(`
        INSERT INTO requests (id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run(
        id,
        patientName.trim(),
        hospitalName.trim(),
        bloodGroup,
        Number(units) || 1,
        contactPhone.trim(),
        requestDate || new Date().toISOString().split('T')[0],
        status || 'Pending'
      );

      const created = db.prepare('SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status FROM requests WHERE id = ?').get(id);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/requests/:id/status
  updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw ApiError.badRequest("Field 'status' is required");
      }

      const validStatuses = ['Pending', 'Approved', 'Fulfilled', 'Rejected'];
      if (!validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
      }

      const existing = db.prepare('SELECT id FROM requests WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Blood request with ID '${id}' not found`);
      }

      db.prepare(`
        UPDATE requests 
        SET status = ?, updatedAt = datetime('now')
        WHERE id = ?
      `).run(status, id);

      const updated = db.prepare('SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status FROM requests WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/requests/:id
  update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Blood request with ID '${id}' not found`);
      }

      const { patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status } = req.body;

      const newPatientName = patientName !== undefined ? patientName.trim() : existing.patientName;
      const newHospitalName = hospitalName !== undefined ? hospitalName.trim() : existing.hospitalName;
      const newBloodGroup = bloodGroup !== undefined ? bloodGroup : existing.bloodGroup;
      const newUnits = units !== undefined ? Number(units) : existing.units;
      const newContactPhone = contactPhone !== undefined ? contactPhone.trim() : existing.contactPhone;
      const newRequestDate = requestDate !== undefined ? requestDate : existing.requestDate;
      const newStatus = status !== undefined ? status : existing.status;

      db.prepare(`
        UPDATE requests 
        SET patientName = ?, hospitalName = ?, bloodGroup = ?, units = ?, contactPhone = ?, requestDate = ?, status = ?, updatedAt = datetime('now')
        WHERE id = ?
      `).run(newPatientName, newHospitalName, newBloodGroup, newUnits, newContactPhone, newRequestDate, newStatus, id);

      const updated = db.prepare('SELECT id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status FROM requests WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/requests/:id
  delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM requests WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Blood request with ID '${id}' not found`);
      }

      db.prepare('DELETE FROM requests WHERE id = ?').run(id);
      res.json({ success: true, message: `Request ${id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = requestController;
