/**
 * Insert the 6 menu items from the spreadsheet into the menu items collection.
 * Maps: category -> mainSectionId + classificationId, country -> countryCode.
 * Ensures Food section, classifications (Pasta, Pizza, Burgers, Salads, Main Course, Soups), and countries (IT, US, GB, FR) exist.
 * Run from backend folder: node seedMenuItemsFromSheet.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const mainSectionSchema = new mongoose.Schema(
  { name: { type: String, required: true }, nameAr: String, slug: { type: String, required: true, unique: true }, order: Number },
  { timestamps: true }
);
const classificationSchema = new mongoose.Schema(
  { name: { type: String, required: true }, nameAr: String, slug: { type: String, required: true }, mainSectionId: { type: String, required: true }, order: Number },
  { timestamps: true }
);
const countrySchema = new mongoose.Schema(
  { code: { type: String, required: true, unique: true }, name: { type: String, required: true }, nameAr: String, flagImageUrl: String },
  { timestamps: true }
);
const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: String,
    nameAr: String,
    description: String,
    descriptionAr: String,
    price: { type: Number, required: true },
    mainSectionId: { type: String, required: true },
    classificationId: { type: String, required: true },
    imageUrl: String,
    imageUrls: { type: [String], default: [] },
    spiceLevel: String,
    calories: Number,
    countryCode: String,
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    order: Number,
  },
  { timestamps: true }
);

const MainSection = mongoose.model('MainSection', mainSectionSchema);
const Classification = mongoose.model('Classification', classificationSchema);
const Country = mongoose.model('Country', countrySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const ROWS = [
  { name: 'Chicken Pasta', price: 15, category: 'Pasta', countryCode: 'IT', description: 'Creamy chicken pasta', imageUrl: 'https://example.com/images/chicken_pasta.jpg', isFeatured: false, isActive: true },
  { name: 'Vegetable Pizza', price: 12, category: 'Pizza', countryCode: 'IT', description: 'Fresh veggie pizza', imageUrl: 'https://example.com/images/vegetable_pizza.jpg', isFeatured: true, isActive: true },
  { name: 'Beef Burger', price: 18, category: 'Burgers', countryCode: 'US', description: 'Classic beef burger', imageUrl: 'https://example.com/images/beef_burger.jpg', isFeatured: false, isActive: true },
  { name: 'Caesar Salad', price: 10, category: 'Salads', countryCode: 'US', description: 'Crisp romaine lettuce', imageUrl: 'https://example.com/images/caesar_salad.jpg', isFeatured: true, isActive: true },
  { name: 'Fish & Chips', price: 16, category: 'Main Course', countryCode: 'GB', description: 'Golden fried fish', imageUrl: 'https://example.com/images/fish_chips.jpg', isFeatured: false, isActive: true },
  { name: 'Tomato Soup', price: 8, category: 'Soups', countryCode: 'FR', description: 'Rich tomato soup', imageUrl: 'https://example.com/images/tomato_soup.jpg', isFeatured: true, isActive: true },
];

const CATEGORY_SLUGS = {
  'Pasta': 'pasta',
  'Pizza': 'pizza',
  'Burgers': 'burgers',
  'Salads': 'salads',
  'Main Course': 'main-course',
  'Soups': 'soups',
};

const COUNTRY_SEED = [
  { code: 'IT', name: 'Italy', nameAr: 'إيطاليا' },
  { code: 'US', name: 'United States', nameAr: 'الولايات المتحدة' },
  { code: 'GB', name: 'Great Britain', nameAr: 'بريطانيا العظمى' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا' },
];

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Main section (use Food or create)
  let section = await MainSection.findOne({ slug: 'food' });
  if (!section) {
    section = await MainSection.create({ name: 'Food', nameAr: 'أطعمة', slug: 'food', order: 0 });
    console.log('Created Main Section: Food');
  }
  const mainSectionId = section._id.toString();

  // 2. Classifications for each category
  const classificationNames = ['Pasta', 'Pizza', 'Burgers', 'Salads', 'Main Course', 'Soups'];
  const classificationMap = {};
  let order = await Classification.countDocuments({ mainSectionId });
  for (const name of classificationNames) {
    const slug = CATEGORY_SLUGS[name] || toSlug(name);
    let classification = await Classification.findOne({ slug, mainSectionId });
    if (!classification) {
      classification = await Classification.create({
        name,
        slug,
        mainSectionId,
        order: order++,
      });
      console.log('Created classification:', name);
    }
    classificationMap[name] = classification._id.toString();
  }

  // 3. Countries
  for (const { code, name, nameAr } of COUNTRY_SEED) {
    const existing = await Country.findOne({ code });
    if (!existing) {
      await Country.create({ code, name, nameAr });
      console.log('Created country:', code, name);
    }
  }

  // 4. Insert menu items (skip if name already exists to avoid duplicates)
  const existingNames = new Set((await MenuItem.find({}, { name: 1 })).map((d) => d.name));
  let inserted = 0;
  const itemOrder = await MenuItem.countDocuments();

  for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];
    if (existingNames.has(row.name)) {
      console.log('Skip (already exists):', row.name);
      continue;
    }
    const classificationId = classificationMap[row.category];
    if (!classificationId) {
      console.warn('No classification for category:', row.category, '- skipping', row.name);
      continue;
    }
    const slug = toSlug(row.name);
    await MenuItem.create({
      name: row.name,
      nameAr: (row.nameAr != null && String(row.nameAr).trim() !== '') ? String(row.nameAr).trim() : row.name,
      slug,
      description: row.description,
      price: row.price,
      mainSectionId,
      classificationId,
      countryCode: row.countryCode || undefined,
      imageUrl: row.imageUrl || undefined,
      imageUrls: row.imageUrl ? [row.imageUrl] : [],
      isActive: row.isActive !== false,
      order: itemOrder + i,
    });
    inserted++;
    console.log('Inserted:', row.name);
  }

  console.log('Done. Inserted', inserted, 'menu items.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
