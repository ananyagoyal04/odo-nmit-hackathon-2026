const app = require('./app');
const { connectDB } = require('./config/mysql');
const { PORT } = require('./config/env');

const startServer = async () => {
  // Connect to MySQL Database & initialize SQL schema
  await connectDB();

  // Listen
  const server = app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Odoo HR System Backend (MySQL Engine) Running`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
    console.log(`=============================================`);
  });

  // Graceful shutdown
  const handleExit = (signal) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleExit('SIGTERM'));
  process.on('SIGINT', () => handleExit('SIGINT'));
};

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
