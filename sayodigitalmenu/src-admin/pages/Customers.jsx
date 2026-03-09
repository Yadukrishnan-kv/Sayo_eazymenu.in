import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCustomers, deleteCustomer } from '../store/slices/customersSlice';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export function Customers() {
  const dispatch = useDispatch();
  const { items: customers, loading } = useSelector((s) => s.customers);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteCustomer(deleteTarget.id)).unwrap();
      toast.success('Customer deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Customers</h1>
          <p className="text-sayo-creamMuted mt-1">Guests who shared their details from the public digital menu.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sayo-creamMuted py-8">Loading...</p>
      ) : customers.length === 0 ? (
        <p className="text-sayo-creamMuted py-8">No customer records yet.</p>
      ) : (
        <>
          <p className="text-sm text-sayo-creamMuted mb-3">Showing {customers.length} customers</p>
          <div className="border border-sayo-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sayo-surface border-b border-sayo-border">
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Date of Birth</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Anniversary</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Notes</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Created</th>
                  <th className="w-16 py-3 px-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-sayo-border last:border-0 hover:bg-sayo-surface/50">
                    <td className="py-3 px-4 text-sayo-cream">{c.name}</td>
                    <td className="py-3 px-4 text-sayo-cream">{c.phone}</td>
                    <td className="py-3 px-4 text-sayo-cream">{c.email || '—'}</td>
                    <td className="py-3 px-4 text-sayo-creamMuted">
                      {c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-sayo-creamMuted">
                      {c.anniversary ? new Date(c.anniversary).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-sayo-creamMuted">
                      {c.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-sayo-creamMuted">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="btn-ghost p-2 text-red-400 hover:text-red-300"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
}

