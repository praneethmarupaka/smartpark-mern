import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`[SmartPark Server] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[${signal}] Received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[SmartPark Server] Closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Startup Error]:', error);
    process.exit(1);
  }
};

startServer();
