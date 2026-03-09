/**
 * Restore backup: BACKUP-PHASE1-0803-2026
 * - Restores sayodigitalmenu and sayo-mern-backend from backup
 * - Imports MongoDB from JSON files (replaces existing data)
 *
 * Usage: node restore-backup-phase1-0803-2026.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BACKUP_NAME = 'BACKUP-PHASE1-0803-2026';
const MONGO_URI = process.env.MONGO_URI;
const RESTORE_TARGET_ROOT = process.env.RESTORE_TARGET_ROOT || path.resolve(__dirname, '..');
const BACKUP_ROOT = path.join(RESTORE_TARGET_ROOT, BACKUP_NAME);
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.vite']);

function copyDirRecursive(src, dest, exclude) {
  if (!fs.existsSync(src)) {
    console.warn('Skip (not found):', src);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    if (exclude.has(e.name)) continue;
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) {
      copyDirRecursive(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function importDatabase(backupDbPath) {
  if (!MONGO_URI) {
    console.warn('MONGO_URI not set; skipping database import.');
    return;
  }
  if (!fs.existsSync(backupDbPath)) {
    console.warn('No database folder in backup; skipping import.');
    return;
  }
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const files = fs.readdirSync(backupDbPath).filter(function (f) {
    return f.endsWith('.json');
  });
  for (const file of files) {
    const collectionName = path.basename(file, '.json');
    const filePath = path.join(backupDbPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const docs = JSON.parse(content);
    await db.collection(collectionName).deleteMany({});
    if (Array.isArray(docs) && docs.length > 0) {
      const result = await db.collection(collectionName).insertMany(docs);
      console.log('  Restored', collectionName, '-', result.insertedCount, 'documents');
    } else {
      console.log('  Cleared', collectionName);
    }
  }
  await mongoose.disconnect();
}

async function main() {
  if (!fs.existsSync(BACKUP_ROOT)) {
    console.error('Backup folder not found:', BACKUP_ROOT);
    process.exit(1);
  }
  console.log('Restoring from:', BACKUP_ROOT);
  console.log('Target folder:', RESTORE_TARGET_ROOT);

  const frontendBackup = path.join(BACKUP_ROOT, 'sayodigitalmenu');
  const backendBackup = path.join(BACKUP_ROOT, 'sayo-mern-backend');
  const targetFrontend = path.join(RESTORE_TARGET_ROOT, 'sayodigitalmenu');
  const targetBackend = path.join(RESTORE_TARGET_ROOT, 'sayo-mern-backend');

  console.log('\nRestoring sayodigitalmenu...');
  if (fs.existsSync(frontendBackup)) {
    copyDirRecursive(frontendBackup, targetFrontend, EXCLUDE_DIRS);
    console.log('  Done.');
  } else {
    console.warn('  No sayodigitalmenu in backup.');
  }

  console.log('Restoring sayo-mern-backend...');
  if (fs.existsSync(backendBackup)) {
    copyDirRecursive(backendBackup, targetBackend, EXCLUDE_DIRS);
    console.log('  Done.');
  } else {
    console.warn('  No sayo-mern-backend in backup.');
  }

  console.log('\nImporting database...');
  await importDatabase(path.join(BACKUP_ROOT, 'database'));

  console.log('\nRestore complete.');
  console.log('Run "npm install" in both sayodigitalmenu and sayo-mern-backend.');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
