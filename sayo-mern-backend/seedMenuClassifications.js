/**
 * Add menu classifications (English + Arabic) under the "Classifications" main section.
 * Keeps existing classifications (e.g. Classi1). Run: node seedMenuClassifications.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const mainSectionSchema = new mongoose.Schema(
  { name: String, nameAr: String, slug: String, order: Number },
  { timestamps: true }
);
const classificationSchema = new mongoose.Schema(
  { name: String, nameAr: String, slug: String, mainSectionId: String, order: Number },
  { timestamps: true }
);

const MainSection = mongoose.model('MainSection', mainSectionSchema);
const Classification = mongoose.model('Classification', classificationSchema);

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

const ITEMS = [
  { name: 'Soups & Appetizers', nameAr: 'الشوربات والمقبلات' },
  { name: 'Noodles', nameAr: 'نودلز' },
  { name: 'Hot Beverages', nameAr: 'مشروبات ساخنة' },
  { name: 'Cold Beverages', nameAr: 'مشروبات باردة' },
  { name: 'Bubble (Boba) Tea', nameAr: 'شاي الفقاعات (بوبا)' },
  { name: 'Mocktails', nameAr: 'موكتيلات' },
  { name: 'Shakes & Smoothies', nameAr: 'سموذي ومخفوقات' },
  { name: 'Fresh Juices', nameAr: 'عصائر طازجة' },
  { name: 'Packaged Beverages', nameAr: 'مشروبات معلبة' },
  { name: 'Soups Vegetarian', nameAr: 'شوربات نباتية' },
  { name: 'Soups Non-Vegetarian', nameAr: 'حساء غير نباتي' },
  { name: 'Salads Vegetarian', nameAr: 'السلطات النباتية' },
  { name: 'Salads Non-Vegetarian', nameAr: 'السلطات (غير نباتية)' },
  { name: 'Sayo Live Sushi Station Vegetarian', nameAr: 'سوشي سايو المباشر (نباتي)' },
  { name: 'Sayo Live Sushi Station Non-Vegetarian', nameAr: 'سوشي سايو المباشر (غير نباتي)' },
  { name: 'Dim Sum & Bao Vegetarian', nameAr: 'ديم سوم وباو نباتي' },
  { name: 'Dim Sum & Bao Non-Vegetarian', nameAr: 'ديم سوم وباو غير نباتي' },
  { name: 'Cheung Fun Vegetarian', nameAr: 'تشيونغ فن نباتي' },
  { name: 'Cheung Fun Non-Vegetarian', nameAr: 'تشيونغ فن غير نباتي' },
  { name: 'Robata Grill Vegetarian', nameAr: 'روباتا جريل نباتي' },
  { name: 'Robata Grill Non-Vegetarian', nameAr: 'روباتا جريل غير نباتي' },
  { name: 'Asian Appetizers Vegetarian', nameAr: 'مقبلات آسيوية نباتية' },
  { name: 'Asian Appetizers Non-Vegetarian', nameAr: 'مقبلات آسيوية غير نباتية' },
  { name: 'Fried Rice & Noodles Vegetarian', nameAr: 'أرز مقلي ونودلز نباتي' },
  { name: 'Fried Rice & Noodles Non-Vegetarian', nameAr: 'أرز مقلي ونودلز غير نباتي' },
  { name: 'Asian Mains & Curries Vegetarian', nameAr: 'أطباق آسيوية رئيسية وكاري نباتي' },
  { name: 'Asian Mains & Curries Non-Vegetarian', nameAr: 'أطباق آسيوية رئيسية وكاري غير نباتي' },
  { name: 'Ramen Bowl Vegetarian', nameAr: 'طبق رامين نباتي' },
  { name: 'Ramen Bowl Non-Vegetarian', nameAr: 'طبق رامين غير نباتي' },
  { name: 'Asian Curry Bowl Vegetarian', nameAr: 'طبق كاري آسيوي نباتي' },
  { name: 'Asian Curry Bowl Non-Vegetarian', nameAr: 'طبق كاري آسيوي غير نباتي' },
  { name: 'Indian Appetizers Vegetarian', nameAr: 'مقبلات هندية نباتية' },
  { name: 'Indian Appetizers Non-Vegetarian', nameAr: 'مقبلات هندية غير نباتية' },
  { name: 'Indian Mains Vegetarian', nameAr: 'أطباق هندية رئيسية نباتية' },
  { name: 'Indian Mains Non-Vegetarian', nameAr: 'أطباق هندية رئيسية غير نباتية' },
  { name: 'Pilaf & Biryani Vegetarian', nameAr: 'بيلاف وبرياني نباتي' },
  { name: 'Pilaf & Biryani Non-Vegetarian', nameAr: 'بيلاف وبرياني غير نباتي' },
  { name: 'Breads', nameAr: 'الخبز' },
];

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  let section = await MainSection.findOne({
    $or: [{ slug: 'classifications' }, { name: /classifications/i }],
  });
  if (!section) {
    section = await MainSection.create({
      name: 'Classifications',
      nameAr: 'التصنيفات',
      slug: 'classifications',
      order: 0,
    });
    console.log('Created Main Section: Classifications');
  }
  const mainSectionId = section._id.toString();

  let order = await Classification.countDocuments({ mainSectionId });
  for (const { name, nameAr } of ITEMS) {
    const slug = toSlug(name);
    const existing = await Classification.findOne({ slug, mainSectionId });
    if (existing) {
      existing.name = name;
      existing.nameAr = nameAr;
      await existing.save();
      console.log('Updated:', name, '/', nameAr);
    } else {
      await Classification.create({
        name,
        nameAr,
        slug,
        mainSectionId,
        order: order++,
      });
      console.log('Created:', name, '/', nameAr);
    }
  }

  console.log('Done. Classifications added under Classifications.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
