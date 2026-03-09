/**
 * Insert 9 menu items from the second table.
 * Maps: item_name -> name + calories, menu_name -> mainSectionId, category_name -> classificationId,
 * type -> tags (vegetarian), country -> countryCode, image filename -> imageUrl placeholder.
 * Run: node seedMenuItemsBatch2.js
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

// Parse item_name like "CRISPY CHICKEN POPSICLES | 350 kcal" -> { name, calories }
function parseItemName(itemName) {
  const s = String(itemName || '').trim();
  const match = s.match(/^\s*(.+?)\s*\|\s*(\d+)\s*kcal\s*$/i);
  if (match) {
    const name = match[1].trim();
    const calories = parseInt(match[2], 10);
    return { name, calories: Number.isNaN(calories) ? undefined : calories };
  }
  return { name: s, calories: undefined };
}

// Normalize category name for matching (e.g. "SOUPS & APPETIZERS" -> "soups-appetizers")
function categoryToSlug(cat) {
  const en = (typeof cat === 'string' ? cat : (cat && cat.en) || '').trim();
  const normalized = en
    .replace(/\s*\/\s*.*$/i, '') // drop "VEGETARIAN/NON-VEGETARIAN" for slug
    .replace(/\s+non-vegetarian$/i, ' non-vegetarian')
    .replace(/\s+vegetarian$/i, ' vegetarian');
  return toSlug(normalized);
}

const ROWS = [
  { item_name: 'CRISPY CHICKEN POPSICLES | 350 kcal', image: '065fa1d9d673ff2c7b704c911f68cfde.png', description: 'Crispy lollipop-style chicken drumsticks tossed in...', type: 'non-veg', price: 35, menu_name: { en: 'Kids Menu' }, category_name: { en: 'Kids' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: '0' },
  { item_name: 'CRUNCHY VIETNAMESE CHICKEN SALAD | 340 kcal', image: '64e26709ec45b485789b337b0f46acf5.jpg', description: 'Shredded chicken tossed with crisp vegetables, fre...', type: 'non-veg', price: 32, menu_name: { en: 'Food Menu' }, category_name: { en: 'SALADS NON-VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'Vietnam.png' },
  { item_name: "CHEF'S SIGNATURE WATERMELON TUNA ROLL (4 PCS.) | 100 kcal", image: '25f5e7f6c5e1466172db678da6dc00c8.jpg', description: 'Watermelon carved like tuna and rolled with Manipu...', type: 'veg', price: 36, menu_name: { en: 'Food Menu' }, category_name: { en: 'SAYO LIVE SUSHI STATION VEGETARIAN/NON-VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'Japan.png' },
  { item_name: 'BBQ UNAGI URAMAKI ROLL (4 PCS.) | 280 kcal', image: '868d587756fd3f87c328bd46f695b2c2.jpg', description: 'Inside-out sushi roll with BBQ-glazed eel, sushi r...', type: 'non-veg', price: 40, menu_name: { en: 'Food Menu' }, category_name: { en: 'SAYO LIVE SUSHI STATION VEGETARIAN/NON-VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'Japan.png' },
  { item_name: 'SASHIMI PLATTER (8PCS.) | 180 kcal', image: '4a7e14a7ee9dfceb8f469086f11e3512.jpg', description: 'An assortment of fresh raw fish slices served with...', type: 'non-veg', price: 72, menu_name: { en: 'Food Menu' }, category_name: { en: 'SAYO LIVE SUSHI STATION VEGETARIAN/NON-VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'Japan.png' },
  { item_name: 'TRUFFLE EDAMAME DUMPLING | 120 kcal', image: 'f0b9bb9c85783ac63fb1ef3b851ccbbe.jpg', description: 'Steamed dumplings filled with edamame and infused', type: 'veg', price: 45, menu_name: { en: 'Food Menu' }, category_name: { en: 'DIM SUM & BAO VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'China.png' },
  { item_name: 'DAIKON & MUSHROOM CAKE | 200 kcal', image: '179a57525551b73bb8bbb2e7bdaf89de.jpg', description: 'Pan fried radish & mushroom cake with a golden cri...', type: 'veg', price: 32, menu_name: { en: 'Food Menu' }, category_name: { en: 'ASIAN APPETIZERS VEGETARIAN/NON-VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'China.png' },
  { item_name: 'SINGAPOREAN CHICKEN CURRY PUFF | 280 kcal', image: '5b9edea987337470397c39dbe97d7878.jpg', description: 'Flaky pastry filled with a spicy and savoury veget...', type: 'non-veg', price: 42, menu_name: { en: 'Food Menu' }, category_name: { en: 'ASIAN APPETIZERS VEGETARIAN/NON-VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'Singapore.png' },
  { item_name: 'THAI CURRY & RICE-VEG | 470 kcal', image: '811610e08cc87fe3e5c880aa6625452b.jpg', description: 'Steam jasmine rice, Thai green curry, Halloumi sha...', type: 'veg', price: 42, menu_name: { en: 'Food Menu' }, category_name: { en: 'ASIAN CURRY BOWL VEGETARIAN' }, is_available: 0, show_on_customer_site: 0, sort_order: 0, country: 'Thailand.png' },
];

const COUNTRY_FROM_TABLE = {
  'Vietnam.png': 'VN',
  'Japan.png': 'JP',
  'China.png': 'CN',
  'Singapore.png': 'SG',
  'Thailand.png': 'TH',
};

const COUNTRY_SEED = [
  { code: 'VN', name: 'Vietnam', nameAr: 'فيتنام' },
  { code: 'JP', name: 'Japan', nameAr: 'اليابان' },
  { code: 'CN', name: 'China', nameAr: 'الصين' },
  { code: 'SG', name: 'Singapore', nameAr: 'سنغافورة' },
  { code: 'TH', name: 'Thailand', nameAr: 'تايلاند' },
];

// Map table category (en) to classification name we look up (existing names in DB)
const CATEGORY_MATCH_NAMES = [
  'Soups & Appetizers',
  'Soups Vegetarian',
  'Soups Non-Vegetarian',
  'Salads Vegetarian',
  'Salads Non-Vegetarian',
  'Sayo Live Sushi Station Vegetarian',
  'Sayo Live Sushi Station Non-Vegetarian',
  'Dim Sum & Bao Vegetarian',
  'Dim Sum & Bao Non-Vegetarian',
  'Asian Appetizers Vegetarian',
  'Asian Appetizers Non-Vegetarian',
  'Asian Curry Bowl Vegetarian',
  'Asian Curry Bowl Non-Vegetarian',
];

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Countries
  for (const { code, name, nameAr } of COUNTRY_SEED) {
    const existing = await Country.findOne({ code });
    if (!existing) {
      await Country.create({ code, name, nameAr });
      console.log('Created country:', code, name);
    }
  }

  // 2. Main sections: Food Menu -> food, Kids Menu -> kids
  let foodSection = await MainSection.findOne({ slug: 'food' });
  if (!foodSection) {
    foodSection = await MainSection.create({ name: 'Food Menu', nameAr: 'قائمة الطعام', slug: 'food', order: 0 });
    console.log('Created Main Section: Food Menu');
  }
  const foodSectionId = foodSection._id.toString();

  let kidsSection = await MainSection.findOne({ slug: 'kids' });
  if (!kidsSection) {
    kidsSection = await MainSection.create({ name: 'Kids Menu', nameAr: 'قائمة الأطفال', slug: 'kids', order: 1 });
    console.log('Created Main Section: Kids Menu');
  }
  const kidsSectionId = kidsSection._id.toString();

  // 3. Classifications: find by name (case-insensitive) or slug across all sections; create "Kids" under Kids if missing
  let kidsClassification = await Classification.findOne({ mainSectionId: kidsSectionId });
  if (!kidsClassification) {
    kidsClassification = await Classification.create({
      name: 'Kids',
      slug: 'kids',
      mainSectionId: kidsSectionId,
      order: 0,
    });
    console.log('Created classification: Kids under Kids Menu');
  }
  const kidsClassificationId = kidsClassification._id.toString();

  const allClassifications = await Classification.find();
  function findClassification(categoryNameEn) {
    const slug = categoryToSlug(categoryNameEn);
    const nameUpper = (categoryNameEn || '').toUpperCase();
    for (const c of allClassifications) {
      const cSlug = toSlug((c.name || '').replace(/\s*\/\s*.*$/, ''));
      if (c.slug === slug || (c.name && toSlug(c.name) === slug)) return c;
      if (c.name && c.name.toUpperCase() === nameUpper) return c;
      if (slug.includes('salad') && (c.name || '').toLowerCase().includes('salads non-vegetarian')) return c;
      if (slug.includes('sushi') && (c.name || '').toLowerCase().includes('sushi station')) return c;
      if (slug.includes('dim-sum') && (c.name || '').toLowerCase().includes('dim sum')) return c;
      if (slug.includes('asian-appetizers') && (c.name || '').toLowerCase().includes('asian appetizers')) return c;
      if (slug.includes('asian-curry') && (c.name || '').toLowerCase().includes('asian curry')) return c;
    }
    return null;
  }

  const existingNames = new Set((await MenuItem.find({}, { name: 1 })).map((d) => d.name));
  let inserted = 0;
  const baseOrder = await MenuItem.countDocuments();

  for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];
    const { name: itemName, calories } = parseItemName(row.item_name);
    if (!itemName) {
      console.warn('Skip row: empty name');
      continue;
    }
    if (existingNames.has(itemName)) {
      console.log('Skip (already exists):', itemName);
      continue;
    }

    const menuEn = (row.menu_name && row.menu_name.en) || '';
    const categoryEn = (row.category_name && row.category_name.en) || '';
    const isKids = /kids/i.test(menuEn);

    let mainSectionId, classificationId;
    if (isKids) {
      mainSectionId = kidsSectionId;
      classificationId = kidsClassificationId;
    } else {
      const classification = findClassification(categoryEn);
      if (!classification) {
        console.warn('No classification for category:', categoryEn, '- skipping', itemName);
        continue;
      }
      mainSectionId = classification.mainSectionId;
      classificationId = classification._id.toString();
    }

    const countryVal = String(row.country || '').trim();
    const countryCode = countryVal === '0' || !countryVal ? undefined : (COUNTRY_FROM_TABLE[countryVal] || countryVal.replace(/\.(png|jpg)$/i, ''));

    const tags = row.type === 'veg' ? ['vegetarian'] : [];
    const imageFilename = row.image ? String(row.image).trim() : '';
    const imageUrl = imageFilename ? `/uploads/${imageFilename}` : undefined;

    await MenuItem.create({
      name: itemName,
      nameAr: (row.nameAr != null && String(row.nameAr).trim() !== '') ? String(row.nameAr).trim() : itemName,
      slug: toSlug(itemName),
      description: (row.description || '').trim() || undefined,
      price: Number(row.price) || 0,
      mainSectionId,
      classificationId,
      countryCode: countryCode || undefined,
      imageUrl,
      imageUrls: imageUrl ? [imageUrl] : [],
      calories: calories != null ? calories : undefined,
      isActive: true,
      tags,
      order: baseOrder + i,
    });
    inserted++;
    console.log('Inserted:', itemName);
  }

  console.log('Done. Inserted', inserted, 'menu items.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
