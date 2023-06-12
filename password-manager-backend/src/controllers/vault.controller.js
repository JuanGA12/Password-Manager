const Vault = require('../models/vault.model.js');
const logger = require('../utils/logger.js');
const User = require('../models/user.model.js');

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
    await User.updateOne({ _id: body.user_id }, { hasVault: true });
    return reply.code(200).send({ message: 'Vault updated' });
  } catch (err) {
    logger.error(err, 'error updating vault');
    return reply.code(401).send(err);
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
module.exports = {
  createVault,
  updateVault,
  findVault,
};
