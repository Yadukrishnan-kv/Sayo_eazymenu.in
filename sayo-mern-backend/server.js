require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
// Allow larger payloads for menu item image uploads (base64 data URLs in JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ----- Mongo connection -----
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sayo-dev-secret';

// Start server only after MongoDB is connected and default admin is ready
function startServer() {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return ensureDefaultAdmin();
  })
  .then(() => startServer())
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// ----- Schemas & Models -----

// Public dish model (for landing page; we keep this for future use)
const dishSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true },
    nameAr: { type: String },
    descriptionEn: { type: String },
    descriptionAr: { type: String },
    category: { type: String },
    categoryKey: { type: String },
    price: { type: Number, required: true },
    pricePerPiece: { type: Number },
    image: { type: String },
    images: [String],
    diet: { type: String },
    calories: { type: Number },
    isStar: { type: Boolean, default: false },
    isChefSpecialty: { type: Boolean, default: false },
    popularity: { type: Number },
    country: { type: String },
    spiceLevel: { type: Number },
    menuGroup: { type: String },
  },
  { timestamps: true }
);

const Dish = mongoose.model('Dish', dishSchema);

// Admin models (match the admin React template)

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' }, // legacy simple role label
    roleId: { type: String }, // references Role._id as string
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // Flexible permissions object, e.g. permissions.mainSections.view = true
    permissions: { type: Object, default: {} },
  },
  { timestamps: true }
);

const mainSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const classificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    slug: { type: String, required: true },
    mainSectionId: { type: String, required: true }, // references MainSection._id as string
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    slug: { type: String, required: true, unique: true },
    color: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

const countrySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameAr: { type: String },
    flagImageUrl: { type: String },
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    dateOfBirth: { type: Date },
    anniversary: { type: Date },
    notes: { type: String },
    source: { type: String }, // e.g. 'public-menu'
  },
  { timestamps: true }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    nameAr: { type: String },
    description: { type: String },
    descriptionAr: { type: String },
    price: { type: Number, required: true },
    mainSectionId: { type: String, required: true },
    classificationId: { type: String, required: true },
    imageUrl: { type: String },
    imageUrls: { type: [String], default: [] },
    spiceLevel: { type: String },
    calories: { type: Number },
    countryCode: { type: String },
    isChefSpecialty: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const settingsSchema = new mongoose.Schema(
  {
    // store a single settings document as a flat object
    data: { type: Object, default: {} },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);
const MainSection = mongoose.model('MainSection', mainSectionSchema);
const Classification = mongoose.model('Classification', classificationSchema);
const Tag = mongoose.model('Tag', tagSchema);
const Country = mongoose.model('Country', countrySchema);
const Customer = mongoose.model('Customer', customerSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Settings = mongoose.model('Settings', settingsSchema);

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: String },
    userEmail: { type: String },
    roleId: { type: String },
    module: { type: String },
    action: { type: String },
    entityId: { type: String },
    entityName: { type: String },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Ensure default admin exists and can log in with admin@example.com / password123
async function ensureDefaultAdmin() {
  const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const defaultPassword = process.env.ADMIN_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  let superRole = await Role.findOne({ name: 'Super Admin' });
  const fullPermissions = {
    mainSections: { view: true, create: true, update: true, delete: true },
    classifications: { view: true, create: true, update: true, delete: true },
    menuItems: { view: true, create: true, update: true, delete: true },
    tags: { view: true, create: true, update: true, delete: true },
    settings: { view: true, update: true },
    users: { view: true, create: true, update: true, delete: true },
    roles: { view: true, create: true, update: true, delete: true },
    countries: { view: true, create: true, update: true, delete: true },
    customers: { view: true, create: true, update: false, delete: true },
    auditLog: { view: true, delete: true },
  };
  if (!superRole) {
    superRole = await Role.create({
      name: 'Super Admin',
      description: 'Full access to all modules',
      permissions: fullPermissions,
    });
  } else {
    // Ensure existing Super Admin role has new modules (e.g. countries) merged in
    const perms = superRole.permissions ? { ...superRole.permissions } : {};
    let updated = false;
    for (const [key, val] of Object.entries(fullPermissions)) {
      const current = perms[key];
      if (!current || typeof current !== 'object') {
        perms[key] = { ...val };
        updated = true;
      } else {
        for (const [action, flag] of Object.entries(val)) {
          if (current[action] !== flag) {
            current[action] = flag;
            updated = true;
          }
        }
      }
    }
    if (updated) {
      superRole.permissions = perms;
      superRole.markModified('permissions');
      await superRole.save();
    }
  }

  const existing = await User.findOne({
    email: { $regex: new RegExp(`^${defaultEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (existing) {
    existing.email = defaultEmail;
    existing.passwordHash = passwordHash;
    existing.roleId = superRole._id.toString();
    existing.isActive = true;
    await existing.save();
    console.log(`Default admin password synced. Login with: ${defaultEmail} / ${defaultPassword}`);
    return;
  }

  await User.create({
    name: 'Admin',
    email: defaultEmail,
    passwordHash,
    role: 'admin',
    roleId: superRole._id.toString(),
    isActive: true,
  });
  console.log(`Default admin created. Login with: ${defaultEmail} / ${defaultPassword}`);
}

// ----- Helpers -----

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject({ versionKey: false });
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function logActivity(req, moduleKey, action, { entityId, entityName, meta } = {}) {
  try {
    const payload = req && req.user ? req.user : {};
    const doc = {
      userId: payload.userId || null,
      userEmail: payload.email || null,
      roleId: payload.roleId || null,
      module: String(moduleKey || ''),
      action: String(action || ''),
      entityId: entityId != null ? String(entityId) : null,
      entityName: entityName != null ? String(entityName) : null,
      meta: meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {},
    };
    await ActivityLog.create(doc);
  } catch (err) {
    console.error('Failed to log activity:', err.message);
    console.error(err);
  }
}

// Permission helper: module = 'menuItems', action = 'create' | 'view' | 'update' | 'delete'
function requirePermission(moduleKey, action) {
  return async function permissionMiddleware(req, res, next) {
    // Legacy full-access admin when no role system is configured yet
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    // If no roleId is set, treat classic "admin" as full access
    if (!req.user.roleId && req.user.role === 'admin') {
      return next();
    }

    if (!req.user.roleId) {
      return res.status(403).json({ message: 'No role assigned to user' });
    }

    try {
      if (!req.userRole) {
        const role = await Role.findById(req.user.roleId);
        if (!role) {
          return res.status(403).json({ message: 'Role not found' });
        }
        req.userRole = role;
      }

      const perms = req.userRole.permissions || {};
      const modulePerms = perms[moduleKey] || {};
      if (modulePerms[action]) {
        return next();
      }

      return res.status(403).json({ message: 'Insufficient permissions' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

// ----- Auth routes -----

app.post('/api/auth/login', async (req, res) => {
  try {
    const body = req.body || {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = body.password;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.passwordHash || typeof user.passwordHash !== 'string') {
      console.error('Login: user has no passwordHash', user.email);
      return res.status(500).json({ message: 'Account setup error. Please run the backend or contact admin.' });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        userId: String(user._id),
        email: String(user.email),
        name: user.name ? String(user.name) : null,
        role: user.role ? String(user.role) : 'admin',
        roleId: user.roleId ? String(user.roleId) : null,
      },
      JWT_SECRET,
      { expiresIn: '8h' },
    );

    try {
      await ActivityLog.create({
        userId: user._id.toString(),
        userEmail: user.email,
        roleId: user.roleId || null,
        module: 'auth',
        action: 'login',
        entityId: null,
        entityName: user.email,
        meta: {},
      });
    } catch (logErr) {
      console.error('Failed to log login activity:', logErr.message);
    }

    return res.json({
      token,
      user: { id: user._id.toString(), email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// ----- Public routes -----

app.get('/', (req, res) => {
  res.send('SAYO API is running');
});

// Keep original dishes endpoint for future landing page use
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ popularity: -1 });
    res.json(dishes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dishes' });
  }
});

// Map stored spice level (string or number) to 0–4 for public menu
function mapSpiceLevelToNumber(val) {
  if (val == null) return undefined;
  const n = Number(val);
  if (!Number.isNaN(n) && n >= 0 && n <= 4) return Math.round(n);
  const s = String(val).toLowerCase();
  const map = { mild: 1, medium: 2, spicy: 3, hot: 4 };
  return map[s] != null ? map[s] : undefined;
}

// Public menu endpoint for customer-facing React app
// Items are ordered by:
// 1) Main section order
// 2) Classification/category order
// 3) Menu item order
app.get('/api/public/menu', async (req, res) => {
  try {
    const [items, classifications, sections, tags, countries] = await Promise.all([
      MenuItem.find({ isActive: { $ne: false } }),
      Classification.find(),
      MainSection.find(),
      Tag.find(),
      Country.find(),
    ]);

    const classMap = new Map();
    classifications.forEach((c) => {
      classMap.set(c._id.toString(), c);
    });

    const sectionMap = new Map();
    sections.forEach((s) => {
      sectionMap.set(s._id.toString(), s);
    });

    const tagById = new Map();
    const tagBySlug = new Map();
    tags.forEach((t) => {
      const id = t._id && t._id.toString();
      if (id) {
        tagById.set(id, t);
      }
      if (t.slug) {
        tagBySlug.set(t.slug, t);
      }
    });
    const countryByCode = new Map();
    countries.forEach((c) => {
      if (c.code) countryByCode.set(c.code, c);
    });

    // Build dishes with sort metadata first
    const dishesWithSort = items.map((item) => {
      const classification = classMap.get(item.classificationId || '') || {};
      const section = sectionMap.get(item.mainSectionId || '') || {};

      const menuGroup =
        section.slug === 'kids'
          ? 'kids'
          : section.slug === 'beverages'
          ? 'beverages'
          : 'food';

      const rawTagKeys = Array.isArray(item.tags) ? item.tags : [];
      const tagDocs = rawTagKeys
        .map((key) => {
          const k = String(key);
          return tagById.get(k) || tagBySlug.get(k);
        })
        .filter(Boolean);
      const tagSlugs = tagDocs
        .map((t) => (t.slug ? t.slug.toLowerCase() : null))
        .filter(Boolean);
      const isVegetarian =
        rawTagKeys.includes('vegetarian') ||
        rawTagKeys.includes('veg') ||
        tagSlugs.includes('vegetarian') ||
        tagSlugs.includes('veg');

      const publicTags = tagDocs.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        nameAr: t.nameAr || t.name,
        slug: t.slug,
        color: t.color,
        icon: t.icon,
      }));

      const allImages = Array.isArray(item.imageUrls) && item.imageUrls.length > 0
        ? item.imageUrls
        : item.imageUrl
          ? [item.imageUrl]
          : [];
      const spiceNum = item.spiceLevel != null ? mapSpiceLevelToNumber(item.spiceLevel) : undefined;

      const sectionOrder = typeof section.order === 'number' ? section.order : 0;
      const classificationOrder = typeof classification.order === 'number' ? classification.order : 0;
      const itemOrder = typeof item.order === 'number' ? item.order : 0;

      return {
        data: {
          id: item._id.toString(),
          nameEn: item.name,
          nameAr: item.nameAr || item.name,
          descriptionEn: item.description || '',
          descriptionAr: item.descriptionAr || '',
          category: classification.name || '',
          categoryAr: classification.nameAr != null && classification.nameAr !== '' ? classification.nameAr : (classification.name || ''),
          categoryKey: classification.slug || (classification._id && classification._id.toString()) || 'misc',
          price: item.price,
          image: allImages[0] || item.imageUrl || '',
          images: allImages,
          diet: isVegetarian ? 'vegetarian' : 'non-vegetarian',
          tags: publicTags,
          calories: item.calories != null ? Number(item.calories) : undefined,
          isStar: false,
          isChefSpecialty: item.isChefSpecialty === true,
          popularity: undefined,
          ingredients: [],
          allergens: [],
          country: item.countryCode || undefined,
          countryFlagImage: (item.countryCode && countryByCode.get(item.countryCode)?.flagImageUrl) || undefined,
          spiceLevel: spiceNum,
          menuGroup,
        },
        _sectionOrder: sectionOrder,
        _classificationOrder: classificationOrder,
        _itemOrder: itemOrder,
      };
    });

    // Sort by section, then classification, then item order
    dishesWithSort.sort((a, b) => {
      if (a._sectionOrder !== b._sectionOrder) {
        return a._sectionOrder - b._sectionOrder;
      }
      if (a._classificationOrder !== b._classificationOrder) {
        return a._classificationOrder - b._classificationOrder;
      }
      if (a._itemOrder !== b._itemOrder) {
        return a._itemOrder - b._itemOrder;
      }
      // Stable fallback: id
      return a.data.id.localeCompare(b.data.id);
    });

    const dishes = dishesWithSort.map((entry) => entry.data);

    res.json(dishes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to build public menu' });
  }
});

// ----- Admin-protected CRUD APIs -----

// Main sections
app.get('/api/main-sections', authMiddleware, requirePermission('mainSections', 'view'), async (req, res) => {
  try {
    const items = await MainSection.find().sort({ order: 1, createdAt: 1 });
    res.json(items.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch main sections' });
  }
});

app.post('/api/main-sections', authMiddleware, requirePermission('mainSections', 'create'), async (req, res) => {
  try {
    const count = await MainSection.countDocuments();
    const { name, nameAr, slug, order } = req.body;
    const section = new MainSection({
      name,
      nameAr,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      order: typeof order === 'number' ? order : count,
    });
    await section.save();
    await logActivity(req, 'mainSections', 'create', {
      entityId: section._id.toString(),
      entityName: section.name,
    });
    res.status(201).json(toPlain(section));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create main section', error: err.message });
  }
});

app.put('/api/main-sections/:id', authMiddleware, requirePermission('mainSections', 'update'), async (req, res) => {
  try {
    const updated = await MainSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Main section not found' });
    await logActivity(req, 'mainSections', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.name,
    });
    res.json(toPlain(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update main section', error: err.message });
  }
});

app.delete('/api/main-sections/:id', authMiddleware, requirePermission('mainSections', 'delete'), async (req, res) => {
  try {
    const deleted = await MainSection.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Main section not found' });
    await logActivity(req, 'mainSections', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
    });
    res.json({ message: 'Main section deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete main section', error: err.message });
  }
});

// Classifications
app.get('/api/classifications', authMiddleware, requirePermission('classifications', 'view'), async (req, res) => {
  try {
    const items = await Classification.find().sort({ mainSectionId: 1, order: 1, createdAt: 1 });
    res.json(items.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch classifications' });
  }
});

app.post('/api/classifications', authMiddleware, requirePermission('classifications', 'create'), async (req, res) => {
  try {
    const { name, nameAr, slug, mainSectionId } = req.body;
    const count = await Classification.countDocuments({ mainSectionId });
    const classification = new Classification({
      name,
      nameAr,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      mainSectionId,
      order: count,
    });
    await classification.save();
    await logActivity(req, 'classifications', 'create', {
      entityId: classification._id.toString(),
      entityName: classification.name,
      meta: { mainSectionId },
    });
    res.status(201).json(toPlain(classification));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create classification', error: err.message });
  }
});

app.put('/api/classifications/:id', authMiddleware, requirePermission('classifications', 'update'), async (req, res) => {
  try {
    const updated = await Classification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Classification not found' });
    await logActivity(req, 'classifications', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.name,
      meta: { mainSectionId: updated.mainSectionId },
    });
    res.json(toPlain(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update classification', error: err.message });
  }
});

app.delete('/api/classifications/:id', authMiddleware, requirePermission('classifications', 'delete'), async (req, res) => {
  try {
    const deleted = await Classification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Classification not found' });
    await logActivity(req, 'classifications', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
      meta: { mainSectionId: deleted.mainSectionId },
    });
    res.json({ message: 'Classification deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete classification', error: err.message });
  }
});

// Menu items
app.get('/api/menu-items', authMiddleware, requirePermission('menuItems', 'view'), async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ order: 1, createdAt: 1 });
    res.json(items.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', authMiddleware, requirePermission('menuItems', 'create'), async (req, res) => {
  try {
    const count = await MenuItem.countDocuments();
    const payload = { ...req.body };
    if (typeof payload.order !== 'number') {
      payload.order = count;
    }
    if (!payload.slug && payload.name) {
      payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-');
    }
    const item = new MenuItem(payload);
    await item.save();
    await logActivity(req, 'menuItems', 'create', {
      entityId: item._id.toString(),
      entityName: item.name,
      meta: { mainSectionId: item.mainSectionId, classificationId: item.classificationId },
    });
    res.status(201).json(toPlain(item));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create menu item', error: err.message });
  }
});

app.put('/api/menu-items/:id', authMiddleware, requirePermission('menuItems', 'update'), async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Menu item not found' });
    await logActivity(req, 'menuItems', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.name,
      meta: { mainSectionId: updated.mainSectionId, classificationId: updated.classificationId },
    });
    res.json(toPlain(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update menu item', error: err.message });
  }
});

app.delete('/api/menu-items/:id', authMiddleware, requirePermission('menuItems', 'delete'), async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
    await logActivity(req, 'menuItems', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
      meta: { mainSectionId: deleted.mainSectionId, classificationId: deleted.classificationId },
    });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete menu item', error: err.message });
  }
});

// Tags
app.get('/api/tags', authMiddleware, requirePermission('tags', 'view'), async (req, res) => {
  try {
    const items = await Tag.find().sort({ name: 1 });
    res.json(items.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', authMiddleware, requirePermission('tags', 'create'), async (req, res) => {
  try {
    const { name, nameAr, slug, color, icon } = req.body;
    const tag = new Tag({
      name,
      nameAr,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      color,
      icon,
    });
    await tag.save();
    await logActivity(req, 'tags', 'create', {
      entityId: tag._id.toString(),
      entityName: tag.name,
    });
    res.status(201).json(toPlain(tag));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create tag', error: err.message });
  }
});

app.put('/api/tags/:id', authMiddleware, requirePermission('tags', 'update'), async (req, res) => {
  try {
    const updated = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Tag not found' });
    await logActivity(req, 'tags', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.name,
    });
    res.json(toPlain(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update tag', error: err.message });
  }
});

app.delete('/api/tags/:id', authMiddleware, requirePermission('tags', 'delete'), async (req, res) => {
  try {
    const deleted = await Tag.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Tag not found' });
    await logActivity(req, 'tags', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
    });
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete tag', error: err.message });
  }
});

// Countries
app.get('/api/countries', authMiddleware, requirePermission('countries', 'view'), async (req, res) => {
  try {
    const items = await Country.find().sort({ name: 1 });
    res.json(items.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
});

app.post('/api/countries', authMiddleware, requirePermission('countries', 'create'), async (req, res) => {
  try {
    const { code, name, nameAr, flagImageUrl } = req.body || {};
    const codeStr = code != null ? String(code).trim().toUpperCase() : '';
    const nameStr = name != null ? String(name).trim() : '';
    if (!codeStr) return res.status(400).json({ message: 'Code is required' });
    if (!nameStr) return res.status(400).json({ message: 'Name is required' });
    const country = new Country({
      code: codeStr,
      name: nameStr,
      nameAr: nameAr != null && nameAr !== '' ? String(nameAr).trim() : undefined,
      flagImageUrl: flagImageUrl != null && flagImageUrl !== '' ? String(flagImageUrl) : undefined,
    });
    await country.save();
    await logActivity(req, 'countries', 'create', {
      entityId: country._id.toString(),
      entityName: country.name,
    });
    res.status(201).json(toPlain(country));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create country', error: err.message });
  }
});

app.put('/api/countries/:id', authMiddleware, requirePermission('countries', 'update'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = String(updates.code).trim().toUpperCase();
    const updated = await Country.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Country not found' });
    await logActivity(req, 'countries', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.name,
    });
    res.json(toPlain(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update country', error: err.message });
  }
});

app.delete('/api/countries/:id', authMiddleware, requirePermission('countries', 'delete'), async (req, res) => {
  try {
    const deleted = await Country.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Country not found' });
    await logActivity(req, 'countries', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
    });
    res.json({ message: 'Country deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete country', error: err.message });
  }
});

// Settings (single document)
app.get('/api/settings', authMiddleware, requirePermission('settings', 'view'), async (req, res) => {
  try {
    let doc = await Settings.findOne();
    if (!doc) {
      doc = new Settings({ data: {} });
      await doc.save();
    }
    const plain = toPlain(doc);
    res.json(plain.data || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', authMiddleware, requirePermission('settings', 'update'), async (req, res) => {
  try {
    let doc = await Settings.findOne();
    if (!doc) {
      doc = new Settings({ data: {} });
    }
    doc.data = { ...(doc.data || {}), ...(req.body || {}) };
    await doc.save();
    await logActivity(req, 'settings', 'update', {
      entityId: doc._id.toString(),
      entityName: 'settings',
    });
    res.json(doc.data);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update settings', error: err.message });
  }
});

// ----- Roles & Users (admin) -----

// Roles
app.get('/api/roles', authMiddleware, requirePermission('roles', 'view'), async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json(roles.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

app.post('/api/roles', authMiddleware, requirePermission('roles', 'create'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = new Role({
      name,
      description,
      permissions: permissions || {},
    });
    await role.save();
    await logActivity(req, 'roles', 'create', {
      entityId: role._id.toString(),
      entityName: role.name,
    });
    res.status(201).json(toPlain(role));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create role', error: err.message });
  }
});

app.put('/api/roles/:id', authMiddleware, requirePermission('roles', 'update'), async (req, res) => {
  try {
    const updated = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    await logActivity(req, 'roles', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.name,
    });
    res.json(toPlain(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update role', error: err.message });
  }
});

app.delete('/api/roles/:id', authMiddleware, requirePermission('roles', 'delete'), async (req, res) => {
  try {
    const deleted = await Role.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Role not found' });
    await logActivity(req, 'roles', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
    });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete role', error: err.message });
  }
});

// Users
app.get('/api/users', authMiddleware, requirePermission('users', 'view'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(
      users.map((u) => ({
        ...toPlain(u),
        passwordHash: undefined,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.post('/api/users', authMiddleware, requirePermission('users', 'create'), async (req, res) => {
  try {
    const { name, email, password, roleId, isActive } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
      role: 'custom',
      roleId: roleId || null,
      isActive: isActive !== false,
    });
    await user.save();
    const plain = toPlain(user);
    delete plain.passwordHash;
    await logActivity(req, 'users', 'create', {
      entityId: user._id.toString(),
      entityName: email,
    });
    res.status(201).json(plain);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create user', error: err.message });
  }
});

app.put('/api/users/:id', authMiddleware, requirePermission('users', 'update'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    const plain = toPlain(updated);
    delete plain.passwordHash;
    await logActivity(req, 'users', 'update', {
      entityId: updated._id.toString(),
      entityName: updated.email,
    });
    res.json(plain);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update user', error: err.message });
  }
});

app.delete('/api/users/:id', authMiddleware, requirePermission('users', 'delete'), async (req, res) => {
  try {
    if (req.user && req.user.userId === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own user' });
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    await logActivity(req, 'users', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.email,
    });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete user', error: err.message });
  }
});

// Customers (public signup + admin view)
app.post('/api/public/customers', async (req, res) => {
  try {
    const { name, phone, email, dateOfBirth, anniversary, notes } = req.body || {};
    const nameStr = typeof name === 'string' ? name.trim() : '';
    const phoneStr = typeof phone === 'string' ? phone.trim() : '';
    if (!nameStr) return res.status(400).json({ message: 'Name is required' });
    if (!phoneStr) return res.status(400).json({ message: 'Contact number is required' });
    const payload = {
      name: nameStr,
      phone: phoneStr,
      email: typeof email === 'string' && email.trim() ? email.trim() : undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      anniversary: anniversary ? new Date(anniversary) : undefined,
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : undefined,
      source: 'public-menu',
    };
    const doc = await Customer.create(payload);
    res.status(201).json({ id: doc._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to submit details', error: err.message });
  }
});

app.get('/api/customers', authMiddleware, requirePermission('customers', 'view'), async (req, res) => {
  try {
    const docs = await Customer.find().sort({ createdAt: -1 });
    res.json(docs.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.delete('/api/customers/:id', authMiddleware, requirePermission('customers', 'delete'), async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Customer not found' });
    await logActivity(req, 'customers', 'delete', {
      entityId: deleted._id.toString(),
      entityName: deleted.name,
    });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete customer', error: err.message });
  }
});

// Audit log routes (Super Admin / roles with auditLog permission)
app.get('/api/audit-log', authMiddleware, requirePermission('auditLog', 'view'), async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const max = Math.min(parseInt(limit || '500', 10) || 500, 2000);
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(max);
    res.json(logs.map(toPlain));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch audit log' });
  }
});

app.delete('/api/audit-log', authMiddleware, requirePermission('auditLog', 'delete'), async (req, res) => {
  try {
    const { ids, from, to } = req.body || {};
    const filter = {};
    if (Array.isArray(ids) && ids.length > 0) {
      filter._id = { $in: ids };
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (!filter._id && !filter.createdAt) {
      return res.status(400).json({ message: 'Provide ids or a date range for deletion' });
    }
    const result = await ActivityLog.deleteMany(filter);
    res.json({ deleted: result.deletedCount || 0 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete audit entries', error: err.message });
  }
});

app.get('/api/audit-log/summary', authMiddleware, requirePermission('auditLog', 'view'), async (req, res) => {
  try {
    const days = Math.max(1, Math.min(parseInt(req.query.days || '14', 10) || 14, 90));
    const since = new Date();
    since.setDate(since.getDate() - days + 1);

    const logs = await ActivityLog.find({ createdAt: { $gte: since } }).sort({ createdAt: 1 });
    const counts = new Map();

    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      result.push({ date: key, label, visits: counts.get(key) || 0 });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to summarize audit log' });
  }
});

// ----- Start server -----
// (Server is started in mongoose.connect().then() above, after ensureDefaultAdmin)