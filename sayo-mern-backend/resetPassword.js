/**
 * Reset admin password (no login required).
 * Run from backend folder: node resetPassword.js [email] [newPassword]
 * Or set RESET_ADMIN_EMAIL and RESET_ADMIN_PASSWORD in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
const email = process.argv[2] || process.env.RESET_ADMIN_EMAIL || 'admin@example.com';
const newPassword = process.argv[3] || process.env.RESET_ADMIN_PASSWORD;

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
    roleId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }
  if (!newPassword || newPassword.length < 6) {
    console.error('Usage: node resetPassword.js [email] [newPassword]');
    console.error('Or set RESET_ADMIN_EMAIL and RESET_ADMIN_PASSWORD in .env');
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  console.log(`Password updated for ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
