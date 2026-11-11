/**
 * System Controller
 * Health checking and database reset utility.
 */

const { db, seedDatabase, dbPath } = require('../config/db');

const systemController = {
  // GET /api/health
  getHealth(req, res) {
    try {
      const stats = {
        inventory: db.prepare('SELECT COUNT(*) as count FROM inventory').get().count,
        donors: db.prepare('SELECT COUNT(*) as count FROM donors').get().count,
        requests: db.prepare('SELECT COUNT(*) as count FROM requests').get().count,
        donations: db.prepare('SELECT COUNT(*) as count FROM donations').get().count
      };

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          engine: 'SQLite (node:sqlite)',
          path: dbPath,
          connected: true,
          records: stats
        },
        version: '1.0.0'
      });
    } catch (err) {
      res.status(500).json({
        status: 'unhealthy',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // POST /api/reset
  reset(req, res, next) {
    try {
      seedDatabase(true);
      res.json({
        success: true,
        message: 'Database has been successfully reset to initial realistic sample data conforming to e-RaktKosh standards.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = systemController;
