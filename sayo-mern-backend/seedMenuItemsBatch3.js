/**
 * Insert menu items from the third table format.
 * Columns: Item name + kcal | Image filename | Description (ending with veg/non-veg) | Price |
 *   Menu category (JSON en) | Subcategory (JSON en) | 1 | 0 | Country (c Name.png or c NULL)
 * Country: "c Malaysia.png" -> countryCode MY, create Country if needed; "c NULL" -> no country.
 * Run: node seedMenuItemsBatch3.js
 * Add more rows to ROWS array below to match your table (copy from spreadsheet/CSV).
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

// Parse "NAME 420 kcal" or "NAME | 420 kcal"; if cell looks like image filename, use descriptionTitle or fallback
function parseItemNameAndCalories(cell, descriptionTitle) {
  const s = String(cell || '').trim();
  const kcalMatch = s.match(/(\d+)\s*kcal/i);
  const calories = kcalMatch ? parseInt(kcalMatch[1], 10) : undefined;
  let name = s.replace(/\s*\|\s*\d+\s*kcal\s*$/i, '').replace(/\s+\d+\s*kcal\s*$/i, '').trim();
  if (!name || name.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
    name = descriptionTitle || 'Menu Item';
  }
  return { name, calories };
}

// Parse description: strip trailing " veg" / " non-veg" and return { description, type }
function parseDescription(desc) {
  const s = String(desc || '').trim();
  const vegMatch = s.match(/^(.+?)\s+(veg|non-veg)\s*$/i);
  if (vegMatch) {
    return { description: vegMatch[1].trim(), type: vegMatch[2].toLowerCase() };
  }
  if (/\bveg\s*$/i.test(s)) return { description: s.replace(/\s+veg\s*$/i, '').trim(), type: 'veg' };
  if (/\bnon-veg\s*$/i.test(s)) return { description: s.replace(/\s+non-veg\s*$/i, '').trim(), type: 'non-veg' };
  return { description: s, type: 'non-veg' };
}

// Parse "c Malaysia.png" -> { countryName: "Malaysia", countryCode: "MY" }; "c NULL" -> null
const COUNTRY_NAME_TO_CODE = {
  malaysia: 'MY', thailand: 'TH', india: 'IN', japan: 'JP', china: 'CN', singapore: 'SG',
  vietnam: 'VN', france: 'FR', italy: 'IT', usa: 'US', 'united states': 'US', britain: 'GB',
  'great britain': 'GB', indonesia: 'ID', korea: 'KR', philippines: 'PH', 'sri lanka': 'LK',
};
function parseCountry(cell) {
  const s = String(cell || '').trim();
  if (!s || /c\s*NULL/i.test(s)) return null;
  const match = s.match(/c\s+(.+)\.(png|jpg|jpeg)$/i);
  if (!match) return null;
  const name = match[1].trim();
  const code = COUNTRY_NAME_TO_CODE[name.toLowerCase()] || name.slice(0, 2).toUpperCase();
  return { countryName: name, countryCode: code, flagRef: s };
}

// Parse JSON-like "{\"en\": \"Food Menu\"}" or already object
function parseJsonEn(val) {
  if (val && typeof val.en === 'string') return val.en.trim();
  const s = typeof val === 'string' ? val.trim() : String(val || '');
  const m = s.match(/"en"\s*:\s*"([^"]*)"/);
  return m ? m[1].trim() : s;
}

function categoryToSlug(catEn) {
  const en = (catEn || '').trim()
    .replace(/\s*\/\s*.*$/i, '')
    .replace(/\s+non-vegetarian$/i, ' non-vegetarian')
    .replace(/\s+vegetarian$/i, ' vegetarian');
  return toSlug(en);
}

// --- ROWS: add one object per table row. Use same property names as below. ---
const ROWS = [
  { item_name: 'MALAY CURRY & RICE - VLS 420 kcal', image: '01e1a7ac11d36e9b631e4e8eba07028.jpg', description: 'Steam jasmine rice, green malay curry, Halloumi sh... veg', price: 42, menu_category: { en: 'Food Menu' }, subcategory: { en: 'ASIAN CURRY BOWL VEGETARIAN' }, country: 'c Malaysia.png' },
  { item_name: 'CHILLY GARLIC SEA BREAM 180 kcal', image: '709b1936d3c3033570caec634c6263.png', description: 'Fresh sea bream pan seared with aromatic garlic an... non-veg', price: 15, menu_category: { en: 'Food Menu' }, subcategory: { en: 'SOUPS & APPETIZERS' }, country: 'c NULL' },
  { item_name: 'THAI CURRY & RICE 470 kcal', image: '811610e08cc87fe3e5c880aa6625452b.jpg', description: 'Steam jasmine rice, Thai green curry, Halloumi sha... veg', price: 42, menu_category: { en: 'Food Menu' }, subcategory: { en: 'ASIAN CURRY BOWL VEGETARIAN' }, country: 'c Thailand.png' },
  { item_name: 'SASHIMI PLATTER (8PCS.) 180 kcal', image: '4a7e14a7ee9dfceb8f469086f11e3512.jpg', description: 'An assortment of fresh raw fish slices served with... non-veg', price: 72, menu_category: { en: 'Food Menu' }, subcategory: { en: 'SAYO LIVE SUSHI STATION VEGETARIAN' }, country: 'c Japan.png' },
  { item_name: 'TRUFFLE EDAMAME DUMPLING 120 kcal', image: 'f0b9bb9c85783ac63fb1ef3b851ccbbe.jpg', description: 'Steamed dumplings filled with edamame and infused... veg', price: 45, menu_category: { en: 'Food Menu' }, subcategory: { en: 'DIM SUM & BAO VEGETARIAN' }, country: 'c China.png' },
  { item_name: 'INDIAN CURRY & RICE 380 kcal', image: '5b9edea987337470397c39dbe97d7878.jpg', description: 'Fragrant basmati rice with spiced curry and sides... veg', price: 38, menu_category: { en: 'Food Menu' }, subcategory: { en: 'ASIAN CURRY BOWL VEGETARIAN' }, country: 'c India.png' },
];

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Ensure countries from table (c Name.png)
  const countryRefs = new Map();
  for (const row of ROWS) {
    const c = parseCountry(row.country);
    if (c && !countryRefs.has(c.countryCode)) countryRefs.set(c.countryCode, c);
  }
  for (const [, c] of countryRefs) {
    const existing = await Country.findOne({ code: c.countryCode });
    if (!existing) {
      await Country.create({
        code: c.countryCode,
        name: c.countryName,
        flagImageUrl: c.flagRef || undefined,
      });
      console.log('Created country:', c.countryCode, c.countryName);
    }
  }

  // 2. Main sections: Food Menu -> food, Kids Menu -> kids, SAYO PATISSERIE -> patisserie
  const sectionSlugByMenu = { 'Food Menu': 'food', 'Kids Menu': 'kids', 'SAYO PATISSERIE': 'patisserie' };
  const sections = {};
  for (const [menuName, slug] of Object.entries(sectionSlugByMenu)) {
    let sec = await MainSection.findOne({ slug });
    if (!sec) {
      sec = await MainSection.create({
        name: menuName,
        slug,
        order: Object.keys(sections).length,
      });
      console.log('Created Main Section:', menuName);
    }
    sections[menuName] = { id: sec._id.toString(), slug };
  }
  // Any other menu name -> create section with slug from name
  function getSectionId(menuEn) {
    const name = (menuEn || '').trim();
    if (sections[name]) return sections[name].id;
    const slug = toSlug(name) || 'other';
    if (!sections._dynamic) sections._dynamic = {};
    if (!sections._dynamic[name]) {
      sections._dynamic[name] = { slug, needCreate: true };
    }
    return null;
  }

  const allClassifications = await Classification.find();
  function findClassification(subcategoryEn, mainSectionId) {
    const slug = categoryToSlug(subcategoryEn);
    for (const c of allClassifications) {
      if (c.mainSectionId !== mainSectionId) continue;
      if ((c.slug && c.slug === slug) || (c.name && toSlug(c.name) === slug)) return c;
      if (c.name && c.name.toUpperCase() === (subcategoryEn || '').toUpperCase()) return c;
    }
    for (const c of allClassifications) {
      if ((c.slug && c.slug === slug) || (c.name && toSlug(c.name) === slug)) return c;
      if (c.name && slug.includes('curry') && c.name.toLowerCase().includes('curry')) return c;
      if (c.name && slug.includes('soup') && c.name.toLowerCase().includes('soup')) return c;
      if (c.name && slug.includes('sushi') && c.name.toLowerCase().includes('sushi')) return c;
      if (c.name && slug.includes('dim-sum') && c.name.toLowerCase().includes('dim sum')) return c;
    }
    return null;
  }

  const existingNames = new Set((await MenuItem.find({}, { name: 1 })).map((d) => d.name));
  let inserted = 0;
  const baseOrder = await MenuItem.countDocuments();

  for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];
    const menuEn = parseJsonEn(row.menu_category);
    const subcatEn = parseJsonEn(row.subcategory);

    let mainSectionId = getSectionId(menuEn);
    if (!mainSectionId) {
      const slug = toSlug(menuEn) || 'food';
      let sec = await MainSection.findOne({ slug });
      if (!sec) {
        sec = await MainSection.create({ name: menuEn || 'Food Menu', slug, order: 99 });
        console.log('Created Main Section:', menuEn);
      }
      mainSectionId = sec._id.toString();
      if (!sections[menuEn]) sections[menuEn] = { id: mainSectionId, slug };
    }

    let classification = findClassification(subcatEn, mainSectionId);
    if (!classification) {
      classification = findClassification(subcatEn);
    }
    if (!classification) {
      const slug = categoryToSlug(subcatEn);
      classification = await Classification.findOne({ slug });
    }
    if (!classification) {
      console.warn('No classification for subcategory:', subcatEn, '- skipping', row.item_name);
      continue;
    }
    const classificationId = classification._id.toString();
    if (!mainSectionId) mainSectionId = classification.mainSectionId;

    const { description, type } = parseDescription(row.description);
    const { name: itemName, calories } = parseItemNameAndCalories(row.item_name, description.slice(0, 30));
    if (!itemName) {
      console.warn('Skip row: no item name');
      continue;
    }
    if (existingNames.has(itemName)) {
      console.log('Skip (exists):', itemName);
      continue;
    }

    const countryInfo = parseCountry(row.country);
    const countryCode = countryInfo ? countryInfo.countryCode : undefined;
    const tags = type === 'veg' ? ['vegetarian'] : [];
    const imageFilename = (row.image || '').trim();
    const imageUrl = imageFilename ? `/uploads/${imageFilename}` : undefined;

    await MenuItem.create({
      name: itemName,
      nameAr: (row.nameAr != null && String(row.nameAr).trim() !== '') ? String(row.nameAr).trim() : itemName,
      slug: toSlug(itemName),
      description: description || undefined,
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
