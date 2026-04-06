/**
 * Server Entry Point
 */

require('dotenv').config();
const app = require('./server/app');
const db = require('./server/config/database');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  try {
    // Initialize database connection
    await db.initDatabase();
    console.log('✅ Database initialized');

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║              GPU EARN SERVER STARTED                       ║
╠════════════════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(48)}║
║ Port: ${PORT.toString().padEnd(52)}║
║ API Base URL: http://localhost:${PORT}                    ║
║ Database: ${process.env.DATABASE_PATH || './server/db/gpu-earn.db'}
║                                                            ║
║ Available Endpoints:                                       ║
║   POST   /api/auth/register                               ║
║   POST   /api/auth/login                                  ║
║   POST   /api/auth/refresh                                ║
║   GET    /api/auth/me (protected)                          ║
║   POST   /api/auth/logout (protected)                      ║
║   GET    /health                                           ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      await db.close();
      console.log('Database connection closed');
      console.log('✅ Server shut down successfully');
      process.exit(0);
    });
  } else {
    await db.close();
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();
