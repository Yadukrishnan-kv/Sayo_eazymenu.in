/**
 * Undo the classifications seed: removes the "Classifications" main section
 * and all 14 classifications that were added by seedClassifications.js.
 * Run: node undoSeedClassifications.js
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

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const section = await MainSection.findOne({ slug: 'classifications' });
  if (!section) {
    console.log('No "Classifications" main section found. Nothing to undo.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  const mainSectionId = section._id.toString();
  const deletedClasses = await Classification.deleteMany({ mainSectionId });
  console.log(`Deleted ${deletedClasses.deletedCount} classification(s) under Classifications.`);

  await MainSection.findByIdAndDelete(section._id);
  console.log('Deleted main section: Classifications');

  console.log('Undo complete.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
