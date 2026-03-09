import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../store/slices/usersSlice';
import { fetchRoles } from '../store/slices/rolesSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';

export function Users() {
  const dispatch = useDispatch();
  const { items: users, loading } = useSelector((s) => s.users);
  const { items: roles } = useSelector((s) => s.roles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
  const getRoleName = (roleId) => roles.find((r) => r.id === roleId)?.name || (roleId ? 'Custom' : '—');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setEmail('');
    setPassword('');
    setRoleId('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword('');
    setRoleId(user.roleId || '');
    setIsActive(user.isActive !== false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!editing && !password) {
      toast.error('Password is required for new users');
      return;
    }
    try {
      const payload = {
        name: name.trim() || undefined,
        email: email.trim(),
        roleId: roleId || null,
        isActive,
      };
      if (password) payload.password = password;
      if (editing) {
        await dispatch(updateUser({ id: editing.id, updates: payload })).unwrap();
        toast.success('User updated');
      } else {
        await dispatch(createUser(payload)).unwrap();
        toast.success('User created');
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteUser(deleteTarget.id)).unwrap();
      toast.success('User deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Users</h1>
          <p className="text-sayo-creamMuted mt-1">Manage admin users and assign roles for access control.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Add User
        </Button>
      </div>

      {loading ? (
        <p className="text-sayo-creamMuted py-8">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sayo-creamMuted py-8">No users yet. Add a user and assign a role.</p>
      ) : (
        <>
          <p className="text-sm text-sayo-creamMuted mb-3">Showing {users.length} users</p>
          <div className="border border-sayo-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sayo-surface border-b border-sayo-border">
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-sayo-creamMuted font-medium">Status</th>
                  <th className="w-24 py-3 px-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-sayo-border last:border-0 hover:bg-sayo-surface/50">
                    <td className="py-3 px-4 text-sayo-cream">{user.name || '—'}</td>
                    <td className="py-3 px-4 text-sayo-cream">{user.email}</td>
                    <td className="py-3 px-4 text-sayo-creamMuted">{getRoleName(user.roleId)}</td>
                    <td className="py-3 px-4">
                      <span className={user.isActive !== false ? 'text-green-400' : 'text-sayo-creamMuted'}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEdit(user)} className="btn-ghost p-2" aria-label={`Edit ${user.email}`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(user)} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={`Delete ${user.email}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            <Input label="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required disabled={!!editing} />
            <Input
              label={editing ? 'New password (leave blank to keep current)' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editing ? '••••••••' : '••••••••'}
              required={!editing}
            />
            <Select
              label="Role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              options={roleOptions}
            />
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-sayo-creamMuted">Active</label>
              <Toggle checked={isActive} onChange={setIsActive} aria-label="User active" />
            </div>
          </div>
          <div className="modal-footer-glass shrink-0 p-6 pt-4 border-t border-sayo-border flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.email}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
