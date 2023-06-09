const mongoose = require('mongoose');
const logger = require('./logger');
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Password-Manager');
    logger.info('MongoDB connected...');
  } catch (error) {
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.connection.close();
  return;
}

module.exports = {
  connectDB,
  disconnectDB,
};
