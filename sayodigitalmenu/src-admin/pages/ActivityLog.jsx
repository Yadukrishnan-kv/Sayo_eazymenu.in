import { useState, useCallback } from 'react';
import { ClipboardList, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/api';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

export function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null); // 'selected' | 'range' | null

  const loadLogs = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = { limit: 500 };
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        params.to = to.toISOString();
      }
      const data = await api.auditLog.get(params);
      setLogs(Array.isArray(data) ? data : []);
      setSelectedIds(new Set());
    } catch (e) {
      setError(e?.message || 'Failed to load audit log');
      if (e?.status === 403) {
        setError('Only Super Admin (or roles with Audit Log access) can view this page.');
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  const toggleSelectAll = () => {
    if (selectedIds.size === logs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logs.map((l) => l.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm('selected');
  };

  const handleDeleteByRange = () => {
    if (!dateFrom && !dateTo) {
      toast.error('Set date range first to delete by range.');
      return;
    }
    setDeleteConfirm('range');
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm === 'selected') {
        const ids = [...selectedIds];
        const res = await api.auditLog.delete({ ids });
        toast.success(`Deleted ${res?.deleted ?? ids.length} entries`);
        setSelectedIds(new Set());
      } else {
        const body = {};
        if (dateFrom) body.from = new Date(dateFrom).toISOString();
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          body.to = to.toISOString();
        }
        const res = await api.auditLog.delete(body);
        toast.success(`Deleted ${res?.deleted ?? 0} entries`);
      }
      setDeleteConfirm(null);
      loadLogs();
    } catch (e) {
      if (e?.status === 403) {
        toast.error('Only Super Admin can delete audit log entries.');
      } else {
        toast.error(e?.message || 'Delete failed');
      }
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sayo-accent">Activity Log</h1>
        <p className="text-sayo-creamMuted mt-1">Track all admin activity. Filter by date, bulk select and delete. Only Super Admin can access.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium text-sayo-creamMuted mb-1">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field w-40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sayo-creamMuted mb-1">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field w-40"
            />
          </div>
          <Button onClick={loadLogs} disabled={loading}>
            <Calendar className="w-4 h-4 mr-2 inline" />
            {loading ? 'Loading…' : 'Apply filter'}
          </Button>
        </div>
        {logs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Button variant="secondary" onClick={toggleSelectAll}>
              {selectedIds.size === logs.length ? 'Deselect all' : 'Select all'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Delete selected ({selectedIds.size})
            </Button>
            <Button variant="secondary" onClick={handleDeleteByRange} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Delete by date range
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="py-6 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
          {error}
        </div>
      )}

      {!error && logs.length === 0 && !loading && (
        <div className="py-12 text-center text-sayo-creamMuted">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden />
          <p>No audit log entries. Use the date filter and click &quot;Apply filter&quot; to load entries.</p>
        </div>
      )}

      {!error && logs.length > 0 && (
        <div className="border border-sayo-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-sayo-surface border-b border-sayo-border">
                <th className="text-left py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={logs.length > 0 && selectedIds.size === logs.length}
                    onChange={toggleSelectAll}
                    className="rounded border-sayo-border text-sayo-accent focus:ring-sayo-accent"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Date</th>
                <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">User</th>
                <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Module</th>
                <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Action</th>
                <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-sayo-border last:border-0 hover:bg-sayo-surface/50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(log.id)}
                      onChange={() => toggleSelect(log.id)}
                      className="rounded border-sayo-border text-sayo-accent focus:ring-sayo-accent"
                      aria-label={`Select ${log.id}`}
                    />
                  </td>
                  <td className="py-3 px-4 text-sayo-cream whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="py-3 px-4 text-sayo-cream">{log.userEmail || log.userId || '—'}</td>
                  <td className="py-3 px-4 text-sayo-cream">{log.module || '—'}</td>
                  <td className="py-3 px-4 text-sayo-cream">{log.action || '—'}</td>
                  <td className="py-3 px-4 text-sayo-creamMuted">{log.entityName || log.entityId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm === 'selected'}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete selected entries"
        message={`Permanently delete ${selectedIds.size} selected audit log entries?`}
        confirmLabel="Delete"
      />
      <ConfirmModal
        isOpen={deleteConfirm === 'range'}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete by date range"
        message={`Permanently delete all audit log entries from ${dateFrom || 'start'} to ${dateTo || 'now'}?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
