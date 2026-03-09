import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Shield, Pencil } from 'lucide-react';
import { fetchRoles } from '../store/slices/rolesSlice';
import { MODULES, ACTIONS } from '../lib/permissions';

export function RolePermissions() {
  const dispatch = useDispatch();
  const { items: roles, loading } = useSelector((s) => s.roles);
  const [expandedRole, setExpandedRole] = useState(null);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const getPerm = (role, moduleKey, actionKey) => Boolean(role.permissions?.[moduleKey]?.[actionKey]);

  if (loading) {
    return <p className="text-sayo-creamMuted py-8">Loading...</p>;
  }

  if (roles.length === 0) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold text-sayo-accent mb-2">Role Permissions</h1>
        <p className="text-sayo-creamMuted mb-6">Overview of access per role. Create roles in User Roles first.</p>
        <p className="text-sayo-creamMuted py-8">No roles yet. <Link to="/user-roles" className="text-sayo-accent hover:underline">Add a role</Link> to set permissions.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sayo-accent">Role Permissions</h1>
        <p className="text-sayo-creamMuted mt-1">Overview of View / Add / Edit / Delete access per module. Edit a role in User Roles to change permissions.</p>
      </div>

      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="border border-sayo-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
              className="w-full flex items-center justify-between gap-4 py-4 px-4 hover:bg-sayo-surface/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent">
                  <Shield className="w-6 h-6" aria-hidden />
                </div>
                <div>
                  <p className="font-medium text-sayo-cream">{role.name}</p>
                  <p className="text-sm text-sayo-creamMuted">{role.description || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/user-roles"
                  state={{ editRoleId: role.id }}
                  className="btn-ghost flex items-center gap-2 px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil className="w-4 h-4" />
                  Edit permissions
                </Link>
                <span className="text-sayo-creamMuted">{expandedRole === role.id ? '▼' : '▶'}</span>
              </div>
            </button>
            {expandedRole === role.id && (
              <div className="border-t border-sayo-border bg-sayo-surface/30">
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-sayo-creamMuted">
                        <th className="text-left py-2 px-3 font-medium">Module</th>
                        {ACTIONS.map((a) => (
                          <th key={a.key} className="text-center py-2 px-2 font-medium w-20">{a.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((mod) => (
                        <tr key={mod.key} className="border-t border-sayo-border">
                          <td className="py-2 px-3 text-sayo-cream">{mod.label}</td>
                          {ACTIONS.map((a) => (
                            <td key={a.key} className="text-center py-2 px-2">
                              {getPerm(role, mod.key, a.key) ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-sayo-creamMuted">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
