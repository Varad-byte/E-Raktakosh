/**
 * Donor Controller
 * Handles donor records and donation eligibility updates.
 */

const { db } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const donorController = {
  // GET /api/donors
  getAll(req, res, next) {
    try {
      const rows = db.prepare('SELECT id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate FROM donors ORDER BY rowid DESC').all();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/donors/:id
  getById(req, res, next) {
    try {
      const { id } = req.params;
      const donor = db.prepare('SELECT id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate FROM donors WHERE id = ?').get(id);
      if (!donor) {
        throw ApiError.notFound(`Donor with ID '${id}' not found`);
      }
      res.json(donor);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/donors
  create(req, res, next) {
    try {
      let { id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate } = req.body;

      if (!id) {
        const rand = Math.floor(100 + Math.random() * 900);
        id = `DNR-${rand}`;
      }

      const stmt = db.prepare(`
        INSERT INTO donors (id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run(
        id,
        fullName.trim(),
        Number(age),
        gender,
        bloodGroup,
        contactPhone.trim(),
        city ? city.trim() : '',
        lastDonationDate || ''
      );

      const created = db.prepare('SELECT id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate FROM donors WHERE id = ?').get(id);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/donors/:id
  update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT * FROM donors WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Donor with ID '${id}' not found`);
      }

      const { fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate } = req.body;

      const newFullName = fullName !== undefined ? fullName.trim() : existing.fullName;
      const newAge = age !== undefined ? Number(age) : existing.age;
      const newGender = gender !== undefined ? gender : existing.gender;
      const newBloodGroup = bloodGroup !== undefined ? bloodGroup : existing.bloodGroup;
      const newContactPhone = contactPhone !== undefined ? contactPhone.trim() : existing.contactPhone;
      const newCity = city !== undefined ? city.trim() : existing.city;
      const newLastDonationDate = lastDonationDate !== undefined ? lastDonationDate : existing.lastDonationDate;

      const stmt = db.prepare(`
        UPDATE donors 
        SET fullName = ?, age = ?, gender = ?, bloodGroup = ?, contactPhone = ?, city = ?, lastDonationDate = ?, updatedAt = datetime('now')
        WHERE id = ?
      `);

      stmt.run(newFullName, newAge, newGender, newBloodGroup, newContactPhone, newCity, newLastDonationDate, id);

      const updated = db.prepare('SELECT id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate FROM donors WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/donors/:id
  delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM donors WHERE id = ?').get(id);
      if (!existing) {
        throw ApiError.notFound(`Donor with ID '${id}' not found`);
      }

      db.prepare('DELETE FROM donors WHERE id = ?').run(id);
      res.json({ success: true, message: `Donor ${id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = donorController;
