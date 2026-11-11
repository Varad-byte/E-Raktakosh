/**
 * Database Layer using Node.js built-in `node:sqlite`.
 * Zero-setup, production-ready, fully ACID-compliant embedded database.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const bcrypt = require('bcryptjs');
const { getInitialData } = require('./seed');

const dbPath = process.env.DB_PATH 
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.resolve(process.cwd(), 'data/bbims.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for production performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Initialize database tables
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      facilityName TEXT NOT NULL,
      licenseNumber TEXT NOT NULL,
      nodalOfficer TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      city TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      bloodGroup TEXT NOT NULL,
      units INTEGER NOT NULL,
      collectionDate TEXT NOT NULL,
      expiryDate TEXT NOT NULL,
      donorId TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donors (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      bloodGroup TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      city TEXT NOT NULL,
      lastDonationDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      patientName TEXT NOT NULL,
      hospitalName TEXT NOT NULL,
      bloodGroup TEXT NOT NULL,
      units INTEGER NOT NULL,
      contactPhone TEXT NOT NULL,
      requestDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      donorId TEXT NOT NULL,
      donorName TEXT NOT NULL,
      bloodGroup TEXT NOT NULL,
      units INTEGER NOT NULL DEFAULT 1,
      donationDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Completed',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      lowStockThreshold INTEGER NOT NULL DEFAULT 5,
      nearExpiryDaysThreshold INTEGER NOT NULL DEFAULT 7,
      facilityName TEXT NOT NULL,
      licenseNumber TEXT NOT NULL,
      nodalOfficer TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Seeds initial demo data if tables are empty
 */
function seedDatabase(force = false) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM inventory').get();
  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (force) {
    db.exec(`
      DELETE FROM inventory;
      DELETE FROM donors;
      DELETE FROM requests;
      DELETE FROM donations;
      DELETE FROM settings;
      DELETE FROM users;
    `);
  }

  // Seed default admin user if users table is empty
  if (userCountRow.count === 0 || force) {
    const defaultPasswordHash = bcrypt.hashSync('SecurePassword123', 10);
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users 
      (id, facilityName, licenseNumber, nodalOfficer, email, passwordHash, contactPhone, city, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    insertUser.run(
      'USR-101',
      'Central Regional Blood Centre (e-RaktKosh Partner)',
      'DL-BB-2024-0981',
      'Dr. Amit Roy',
      'admin@bloodbank.org',
      defaultPasswordHash,
      '+91 11 2345 6789',
      'New Delhi',
      'admin'
    );
  }

  if (countRow && countRow.count > 0 && !force) {
    return; // Already seeded
  }

  const { settings, inventory, donors, requests, donations } = getInitialData();

  // Settings
  const insertSettings = db.prepare(`
    INSERT OR REPLACE INTO settings 
    (id, lowStockThreshold, nearExpiryDaysThreshold, facilityName, licenseNumber, nodalOfficer, contactPhone, updatedAt)
    VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  insertSettings.run(
    settings.lowStockThreshold,
    settings.nearExpiryDaysThreshold,
    settings.facilityName,
    settings.licenseNumber,
    settings.nodalOfficer,
    settings.contactPhone
  );

  // Inventory
  const insertInventory = db.prepare(`
    INSERT OR REPLACE INTO inventory 
    (id, bloodGroup, units, collectionDate, expiryDate, donorId, notes, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  for (const b of inventory) {
    insertInventory.run(b.id, b.bloodGroup, b.units, b.collectionDate, b.expiryDate, b.donorId || '', b.notes || '');
  }

  // Donors
  const insertDonor = db.prepare(`
    INSERT OR REPLACE INTO donors 
    (id, fullName, age, gender, bloodGroup, contactPhone, city, lastDonationDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  for (const d of donors) {
    insertDonor.run(d.id, d.fullName, d.age, d.gender, d.bloodGroup, d.contactPhone, d.city, d.lastDonationDate || '');
  }

  // Requests
  const insertRequest = db.prepare(`
    INSERT OR REPLACE INTO requests 
    (id, patientName, hospitalName, bloodGroup, units, contactPhone, requestDate, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  for (const r of requests) {
    insertRequest.run(r.id, r.patientName, r.hospitalName, r.bloodGroup, r.units, r.contactPhone, r.requestDate, r.status);
  }

  // Donations
  const insertDonation = db.prepare(`
    INSERT OR REPLACE INTO donations 
    (id, donorId, donorName, bloodGroup, units, donationDate, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  for (const dn of donations) {
    insertDonation.run(dn.id, dn.donorId, dn.donorName, dn.bloodGroup, dn.units, dn.donationDate, dn.status);
  }
}

// Initialize tables and seed on module load
initSchema();
seedDatabase();

module.exports = {
  db,
  seedDatabase,
  dbPath
};
