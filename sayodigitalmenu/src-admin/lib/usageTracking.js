const STORAGE_KEY = 'sayo_admin_usage';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStoredUsage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function recordVisit() {
  const key = getTodayKey();
  const usage = getStoredUsage();
  usage[key] = (usage[key] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function getUsageByDay(days = 14) {
  const usage = getStoredUsage();
  const result = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    result.push({
      date: key,
      label,
      visits: usage[key] || 0,
    });
  }

  return result;
}
