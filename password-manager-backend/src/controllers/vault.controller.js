const Vault = require('../models/vault.model.js');
const logger = require('../utils/logger.js');

const createVault = async (body) => {
  try {
    const vault = new Vault(body);
    await vault.save();
    return vault;
  } catch (err) {
    logger.error(err, 'error updating vault');
    return null;
  }
};

const updateVault = async (request, reply) => {
  try {
    const body = JSON.parse(request.body);
    console.log(body);
    await Vault.updateOne(
      { user: body.user_id },
      { data: body.data, nonce: body.nonce, mac: body.mac }
    );
    return reply.code(200).send({ message: 'Vault updated', status: 200 });
  } catch (err) {
    logger.error(err, 'error updating vault');
    return reply
      .code(400)
      .send({ message: 'Error updating vault', status: 400 });
  }
};

const findVault = async (body) => {
  try {
    const vault = await Vault.findOne({ user: body.user_id });
    if (!vault) {
      logger.error('error finding vault');
      return null;
    }
    return vault;
  } catch (err) {
    logger.error(err, 'error finding vault');
    return null;
  }
};

const getVault = async (request, reply) => {
  try {
    const {user_id} = request.body
    const vault = await Vault.findOne({ user: user_id });
    console.log(user_id)
    return reply.code(200).send({ vault: vault, status: 200 });
  } catch (error) {
    logger.error(error, 'error finding vault');
    return reply.code(400).send({ vault: 'Error finding vault', status: 400 });
  }
};

module.exports = {
  createVault,
  updateVault,
  findVault,
  getVault,
};
