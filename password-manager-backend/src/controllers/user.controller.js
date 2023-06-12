const User = require('../models/user.model.js');
const vaultControllers = require('./vault.controller');
const logger = require('../utils/logger.js');
const argon2 = require('argon2');

const createUser = async (request, reply) => {
  try {
    const { email, password, phone } = JSON.parse(request.body);
    const passHashed = await argon2.hash(password);
    const user = new User({ email, password: passHashed, phone });
    await user.save();
    const vault = await vaultControllers.createVault({
      data: '',
      user: user._id,
      nonce: '',
    });
    if (vault) {
      return reply.code(200).send({
        user_id: user._id,
        user_email: user.email,
        user_pass: user.password,
        vault_data: vault.data,
        user_vault: user.hasVault,
        vault_nonce: vault.nonce,
        vault_mac: vault.mac,
      });
    }
    logger.error('error creating user');
    return reply.code(401).send({ message: 'Error' });
  } catch (err) {
    logger.error(err, 'error creating user');
    reply.code(401).send(err);
  }
};

const loginUser = async (request, reply) => {
  try {
    const { email, password } = JSON.parse(request.body);
    const user = await User.findOne({ email: email });
    const verified = await argon2.verify(user.password, password);
    if (!user || !verified) {
      logger.error('error login user');
      return reply.status(401).send({
        message: 'Invalid email or password',
      });
    }

    const vault = await vaultControllers.findVault({
      user_id: user._id,
    });
    if (!vault) {
      logger.error('error finding vault');
      return reply.status(401).send({
        message: 'Error finding vault by user_id',
      });
    }

    return reply.code(200).send({
      user_id: user._id,
      user_email: user.email,
      user_pass: user.password,
      vault_data: vault.data,
      user_vault: user.hasVault,
      vault_nonce: vault.nonce,
      vault_mac: vault.mac,
    });
  } catch (err) {
    logger.error(err, 'error login user');
    return reply.code(401).send(err);
  }
};

module.exports = {
  createUser,
  loginUser,
};
