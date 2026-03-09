require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    permissions: { type: Object, default: {} },
  },
  { timestamps: true }
);

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

const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'password123';

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Ensure a Super Admin role exists with full permissions
  let superRole = await Role.findOne({ name: 'Super Admin' });
  if (!superRole) {
    superRole = await Role.create({
      name: 'Super Admin',
      description: 'Full access to all modules',
      permissions: {
        mainSections: { view: true, create: true, update: true, delete: true },
        classifications: { view: true, create: true, update: true, delete: true },
        menuItems: { view: true, create: true, update: true, delete: true },
        tags: { view: true, create: true, update: true, delete: true },
        settings: { view: true, update: true },
        users: { view: true, create: true, update: true, delete: true },
        roles: { view: true, create: true, update: true, delete: true },
        auditLog: { view: true, delete: true },
      },
    });
    console.log('Created Super Admin role');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists with email ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: 'Admin',
    email,
    passwordHash,
    role: 'admin',
    roleId: superRole._id.toString(),
    isActive: true,
  });

  console.log('Admin user created:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

