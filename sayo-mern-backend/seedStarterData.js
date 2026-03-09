/**
 * Restore minimal starter data so the admin panel works again:
 * - Main Sections (Food, Beverages)
 * - Classifications under each (Soups, Salads, Mains; Drinks)
 * - Tags (Vegetarian, Spicy)
 * Only adds data when collections are empty. Safe to run multiple times.
 * Run: node seedStarterData.js
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
const tagSchema = new mongoose.Schema(
  { name: { type: String, required: true }, nameAr: String, slug: { type: String, required: true, unique: true }, color: String, icon: String },
  { timestamps: true }
);

const MainSection = mongoose.model('MainSection', mainSectionSchema);
const Classification = mongoose.model('Classification', classificationSchema);
const Tag = mongoose.model('Tag', tagSchema);

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Main Sections
  const mainSectionCount = await MainSection.countDocuments();
  if (mainSectionCount === 0) {
    await MainSection.insertMany([
      { name: 'Food', nameAr: 'أطعمة', slug: 'food', order: 0 },
      { name: 'Beverages', nameAr: 'مشروبات', slug: 'beverages', order: 1 },
    ]);
    console.log('Created Main Sections: Food, Beverages');
  } else {
    console.log('Main Sections already exist, skipping.');
  }

  // 2. Classifications (under each main section)
  const foodSection = await MainSection.findOne({ slug: 'food' });
  const beveragesSection = await MainSection.findOne({ slug: 'beverages' });

  if (foodSection) {
    const foodClassCount = await Classification.countDocuments({ mainSectionId: foodSection._id.toString() });
    if (foodClassCount === 0) {
      await Classification.insertMany([
        { name: 'Soups', nameAr: 'شوربات', slug: 'soups', mainSectionId: foodSection._id.toString(), order: 0 },
        { name: 'Salads', nameAr: 'سلطات', slug: 'salads', mainSectionId: foodSection._id.toString(), order: 1 },
        { name: 'Mains', nameAr: 'أطباق رئيسية', slug: 'mains', mainSectionId: foodSection._id.toString(), order: 2 },
      ]);
      console.log('Created Classifications under Food: Soups, Salads, Mains');
    }
  }

  if (beveragesSection) {
    const bevClassCount = await Classification.countDocuments({ mainSectionId: beveragesSection._id.toString() });
    if (bevClassCount === 0) {
      await Classification.insertMany([
        { name: 'Drinks', nameAr: 'مشروبات', slug: 'drinks', mainSectionId: beveragesSection._id.toString(), order: 0 },
      ]);
      console.log('Created Classifications under Beverages: Drinks');
    }
  }

  // 3. Tags
  const tagCount = await Tag.countDocuments();
  if (tagCount === 0) {
    await Tag.insertMany([
      { name: 'Vegetarian', nameAr: 'نباتي', slug: 'vegetarian', color: '#22c55e', icon: 'leaf' },
      { name: 'Spicy', nameAr: 'حار', slug: 'spicy', color: '#ef4444', icon: 'spicy' },
    ]);
    console.log('Created Tags: Vegetarian, Spicy');
  } else {
    console.log('Tags already exist, skipping.');
  }

  console.log('Starter data done. You can add menu items in the admin again.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
