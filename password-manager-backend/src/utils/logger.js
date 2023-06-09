const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'hostname',
    },
  },
});

module.exports = logger;
