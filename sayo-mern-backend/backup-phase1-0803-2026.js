/**
 * Create backup: BACKUP-PHASE1-0803-2026
 * Usage: node backup-phase1-0803-2026.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BACKUP_NAME = 'BACKUP-PHASE1-0803-2026';
const MONGO_URI = process.env.MONGO_URI;
const BACKEND_ROOT = path.resolve(__dirname);
const PROJECTS_ROOT = path.dirname(BACKEND_ROOT);
const FRONTEND_ROOT = path.join(PROJECTS_ROOT, 'sayodigitalmenu');
const BACKUP_ROOT = path.join(PROJECTS_ROOT, BACKUP_NAME);
const EXCLUDE = new Set(['node_modules', '.git', 'dist', 'build', '.vite']);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

async function exportDb(dir) {
  if (!MONGO_URI) return;
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  fs.mkdirSync(dir, { recursive: true });
  for (const { name } of await db.listCollections().toArray()) {
    const docs = await db.collection(name).find({}).toArray();
    fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(docs, null, 2), 'utf8');
    console.log('  Exported', name);
  }
  await mongoose.disconnect();
}

async function main() {
  console.log('Backup:', BACKUP_NAME, '->', BACKUP_ROOT);
  if (fs.existsSync(BACKUP_ROOT)) fs.rmSync(BACKUP_ROOT, { recursive: true });
  fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  console.log('Copying sayodigitalmenu...');
  copyDir(FRONTEND_ROOT, path.join(BACKUP_ROOT, 'sayodigitalmenu'));
  console.log('Copying sayo-mern-backend...');
  copyDir(BACKEND_ROOT, path.join(BACKUP_ROOT, 'sayo-mern-backend'));
  console.log('Exporting database...');
  await exportDb(path.join(BACKUP_ROOT, 'database'));
  fs.writeFileSync(
    path.join(BACKUP_ROOT, 'backup-info.json'),
    JSON.stringify({ backupName: BACKUP_NAME, createdAt: new Date().toISOString() }, null, 2),
    'utf8'
  );
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
