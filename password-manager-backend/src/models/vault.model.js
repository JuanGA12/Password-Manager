const { Schema, model } = require('mongoose');

const vaultSchema = new Schema(
  {
    data: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    nonce: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model('Vault', vaultSchema);
