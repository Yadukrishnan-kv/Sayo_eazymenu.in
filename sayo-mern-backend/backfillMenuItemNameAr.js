/**
 * Set nameAr = name for all menu items where nameAr is missing or empty.
 * Run once: node backfillMenuItemNameAr.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    description: String,
    price: Number,
    mainSectionId: String,
    classificationId: String,
    imageUrl: String,
    imageUrls: [String],
    countryCode: String,
    isActive: Boolean,
    tags: [String],
    order: Number,
  },
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const items = await MenuItem.find({});
  let updated = 0;
  for (const item of items) {
    const currentAr = item.nameAr;
    if (currentAr == null || String(currentAr).trim() === '') {
      await MenuItem.updateOne(
        { _id: item._id },
        { $set: { nameAr: item.name || '' } }
      );
      updated++;
      console.log('Set nameAr:', item.name);
    }
  }

  console.log('Done. Updated', updated, 'menu items with nameAr = name.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
