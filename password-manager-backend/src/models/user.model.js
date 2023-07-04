const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    // hasVault: { type: Boolean, default: false },
    code: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('User', userSchema);
