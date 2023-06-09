const fastify = require('fastify')({ logger: true });
const db = require('./utils/mongoose');
const logger = require('./utils/logger');
const cors = require('@fastify/cors');
function gracefulShutdown(signal, app) {
  process.on(signal, async () => {
    logger.info(`Goodbye, got signal ${signal}`);
    app.close();
    await db.disconnectDB();
    logger.info('My work here is done');
    process.exit(0);
  });
}

const userRoutes = require('./routes/user.routes.js');
const vaultRoutes = require('./routes/vault.routes.js');
userRoutes.forEach((route) => {
  fastify.route(route);
});
vaultRoutes.forEach((route) => {
  fastify.route(route);
});
fastify.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true,
});
const start = async () => {
  try {
    url = await fastify.listen({ port: 4000 });
    logger.info(`Server is ready at ${url}`);
    await db.connectDB();
  } catch (err) {
    logger.error(e);
    process.exit(1);
  }
  const signals = ['SIGTERM', 'SIGINT'];

  for (let i = 0; i < signals.length; i++) {
    gracefulShutdown(signals[i], fastify);
  }
};
start();
