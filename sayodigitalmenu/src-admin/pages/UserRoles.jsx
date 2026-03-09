import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../store/slices/rolesSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { MODULES, ACTIONS, mergePermissions } from '../lib/permissions';

export function UserRoles() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { items: roles, loading } = useSelector((s) => s.roles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState(mergePermissions());

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    const editRoleId = location.state?.editRoleId;
    if (editRoleId && roles.length > 0) {
      const role = roles.find((r) => r.id === editRoleId);
      if (role) {
        setEditing(role);
        setName(role.name || '');
        setDescription(role.description || '');
        setPermissions(mergePermissions(role.permissions));
        setModalOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.editRoleId, roles, navigate, location.pathname]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setPermissions(mergePermissions());
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setName(role.name || '');
    setDescription(role.description || '');
    setPermissions(mergePermissions(role.permissions));
    setModalOpen(true);
  };

  const setPerm = (moduleKey, actionKey, value) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [actionKey]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    try {
      const payload = { name: name.trim(), description: description.trim(), permissions };
      if (editing) {
        await dispatch(updateRole({ id: editing.id, updates: payload })).unwrap();
        toast.success('Role updated');
      } else {
        await dispatch(createRole(payload)).unwrap();
        toast.success('Role created');
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteRole(deleteTarget.id)).unwrap();
      toast.success('Role deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">User Roles</h1>
          <p className="text-sayo-creamMuted mt-1">Create roles and set access (View, Add, Edit, Delete) per module.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Role
        </Button>
      </div>

      {loading ? (
        <p className="text-sayo-creamMuted py-8">Loading...</p>
      ) : roles.length === 0 ? (
        <p className="text-sayo-creamMuted py-8">No roles yet. Create a role and assign permissions.</p>
      ) : (
        <>
          <p className="text-sm text-sayo-creamMuted mb-3">Showing {roles.length} roles</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group"
              >
                <div className="p-3 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent">
                  <Shield className="w-8 h-8" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sayo-cream">{role.name}</p>
                  <p className="text-sm text-sayo-creamMuted line-clamp-1">{role.description || '—'}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => openEdit(role)} className="btn-ghost p-2" aria-label={`Edit ${role.name}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(role)} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={`Delete ${role.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Role' : 'Add Role'}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            <Input label="Role name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Content Editor" required />
            <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Can edit menu and tags only" rows={2} />

            <div className="pt-2">
              <p className="text-sm font-medium text-sayo-cream mb-3">Permissions</p>
              <div className="border border-sayo-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sayo-surface border-b border-sayo-border">
                      <th className="text-left py-2 px-3 text-sayo-creamMuted font-medium">Module</th>
                      {ACTIONS.map((a) => (
                        <th key={a.key} className="text-center py-2 px-2 text-sayo-creamMuted font-medium w-20">{a.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod) => (
                      <tr key={mod.key} className="border-b border-sayo-border last:border-0 hover:bg-sayo-surface/50">
                        <td className="py-2 px-3 text-sayo-cream">{mod.label}</td>
                        {ACTIONS.map((a) => (
                          <td key={a.key} className="text-center py-2 px-2">
                            <input
                              type="checkbox"
                              checked={Boolean(permissions[mod.key]?.[a.key])}
                              onChange={(e) => setPerm(mod.key, a.key, e.target.checked)}
                              className="rounded border-sayo-border text-sayo-accent focus:ring-sayo-accent"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        title="Delete Role"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Users with this role will have no permissions until assigned a new role.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
