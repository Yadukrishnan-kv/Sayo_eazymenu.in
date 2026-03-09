# SAYO Menu Admin

A fully functional React Admin Panel for the SAYO Pan Asian Restaurant menu. Manage categories, menu items, tags, media, and settings with a premium dark theme matching the SAYO brand.

## Features

- **Dashboard** – Overview with stats and quick links
- **Main Sections** – Food menu, Kids menu, Beverages menu (top-level nav)
- **Classifications** – Soups, Salads, Sushi, Mains, Desserts, etc. (filters inside each section)
- **Menu Items** – Full CRUD with cascading select (Section → Classification), inline image upload, spice level dropdown, availability toggle, tags
- **Tags** – Vegetarian, Spicy, etc. for dietary filtering
- **Media Manager** – Upload images, copy URLs for use in menu items
- **Settings** – Restaurant name, tagline, currency, public menu URL
- **Light/Dark theme** – Toggle in sidebar, preference saved to localStorage

## Tech Stack

- React 19 + Vite
- Redux Toolkit (state management)
- React Router v7
- Tailwind CSS (SAYO brand theme: dark bg, warm gold accents)
- React Hook Form + Zod (validation)
- @dnd-kit (drag reorder)
- React Hot Toast (notifications)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Data

Uses a mock API with `localStorage` persistence. Data keys: `sayo_main_sections`, `sayo_classifications`, `sayo_menu_items`, `sayo_tags`, `sayo_settings`.

To integrate with a real REST API, replace the functions in `src/api/mockApi.js` with your API calls.

## Project Structure

```
src/
├── api/          # Mock API (replace with real REST)
├── components/
│   ├── layout/   # Sidebar, Layout
│   ├── media/    # MediaPicker
│   ├── sortable/ # Drag-and-drop (classifications)
│   └── ui/       # Button, Input, Modal, etc.
├── pages/        # Dashboard, Categories, MenuItems, etc.
├── context/      # ThemeContext (light/dark)
├── store/        # Redux slices
└── lib/          # Theme constants
```

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, Escape)
- Focus-visible outlines (gold)
- Semantic HTML
