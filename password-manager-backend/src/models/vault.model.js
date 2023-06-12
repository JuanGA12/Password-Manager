const { Schema, model } = require('mongoose');

const vaultSchema = new Schema(
  {
    data: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    nonce: String,
    mac: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Vault', vaultSchema);
