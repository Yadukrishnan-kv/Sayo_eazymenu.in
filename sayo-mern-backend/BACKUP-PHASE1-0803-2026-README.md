# Backup: BACKUP-PHASE1-0803-2026

This document describes how to **create** and **restore** the backup named **BACKUP-PHASE1-0803-2026** (Phase 1 snapshot dated 08 March 2026).

## What is included

- **sayodigitalmenu** – Frontend (public menu + admin panel), excluding `node_modules`, `.git`, `dist`, `build`, `.vite`
- **sayo-mern-backend** – Backend API, excluding `node_modules`, `.git`
- **database** – MongoDB export: one JSON file per collection (users, roles, mainsections, classifications, tags, menuitems, settings, activitylogs, etc.)

Backup folder layout:

```
BACKUP-PHASE1-0803-2026/
  sayodigitalmenu/     (frontend project files)
  sayo-mern-backend/   (backend project files)
  database/            (e.g. users.json, menuitems.json, ...)
  backup-info.json     (backup timestamp and description)
```

---

## 1. Create the backup

From the backend project:

```powershell
cd C:\Users\manus\projects\sayo-mern-backend
node backup-phase1-0803-2026.js
```

- Backup is created at: **`C:\Users\manus\projects\BACKUP-PHASE1-0803-2026`**
- Requires **MONGO_URI** in `.env` so the database can be exported.
- If the folder already exists, it is replaced.

---

## 2. Restore from this backup

From the backend project (or from the folder that contains BACKUP-PHASE1-0803-2026):

```powershell
cd C:\Users\manus\projects\sayo-mern-backend
node restore-backup-phase1-0803-2026.js
```

- Restores **sayodigitalmenu** and **sayo-mern-backend** into the parent folder of the backup (default: `C:\Users\manus\projects`).
- Imports the **database** into the MongoDB pointed to by **MONGO_URI** in `.env` (existing collections are cleared then refilled from the JSON files).
- Does **not** copy `node_modules`; run **npm install** in both projects after restore.

Optional: restore to a different parent folder:

```powershell
set RESTORE_TARGET_ROOT=C:\path\to\parent
node restore-backup-phase1-0803-2026.js
```

After restore:

```powershell
cd C:\Users\manus\projects\sayodigitalmenu
npm install

cd C:\Users\manus\projects\sayo-mern-backend
npm install
```

Then start backend and frontend as usual.

---

## 3. Restoring only files or only database

- **Only files:** Copy the `sayodigitalmenu` and `sayo-mern-backend` folders from `BACKUP-PHASE1-0803-2026` over your current projects (avoid overwriting `.env` with an old one if you changed secrets).
- **Only database:** Run the restore script; it will overwrite project folders too. To import only DB, use the same script logic: connect with **MONGO_URI**, then for each `database/*.json` clear the matching collection and `insertMany` the parsed JSON. You can copy the import loop from `restore-backup-phase1-0803-2026.js` into a small one-off script if needed.

---

## 4. Backup name and date

- **Name:** BACKUP-PHASE1-0803-2026  
- **Date:** 08 March 2026 (Phase 1)  
- To create a new backup with the same name (e.g. after more work), run the backup script again; it will replace the existing `BACKUP-PHASE1-0803-2026` folder.
