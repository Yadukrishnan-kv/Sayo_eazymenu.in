// Module keys must match backend requirePermission(moduleKey, action)
export const MODULES = [
  { key: 'mainSections', label: 'Main Sections' },
  { key: 'classifications', label: 'Classifications' },
  { key: 'menuItems', label: 'Menu Items' },
  { key: 'tags', label: 'Tags' },
  { key: 'settings', label: 'Settings' },
  { key: 'roles', label: 'User Roles' },
  { key: 'users', label: 'Users' },
  { key: 'auditLog', label: 'Audit Log' },
];

export const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Add' },
  { key: 'update', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
];

export function getEmptyPermissions() {
  const perms = {};
  MODULES.forEach((m) => {
    perms[m.key] = {};
    ACTIONS.forEach((a) => { perms[m.key][a.key] = false; });
  });
  return perms;
}

export function mergePermissions(existing = {}) {
  const perms = getEmptyPermissions();
  MODULES.forEach((m) => {
    const mod = existing[m.key] || {};
    ACTIONS.forEach((a) => {
      perms[m.key][a.key] = Boolean(mod[a.key]);
    });
  });
  return perms;
}
