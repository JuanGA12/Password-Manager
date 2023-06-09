const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: { type: String, unique: true },
    password: String,
    phone: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model('User', userSchema);
