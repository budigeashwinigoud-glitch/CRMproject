import React, { useEffect, useState } from 'react';
import crmApi from '../services/api';
import { UserCog, Plus, RefreshCw, UserCheck, UserX, Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const data = await crmApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load users. Administrator credentials required.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await crmApi.createUser({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        is_active: true
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setRole('EMPLOYEE');
      setMessage('User account created successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to create user.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(user) {
    setError('');
    setMessage('');

    try {
      const currentActive = user.isActive ?? user.is_active ?? true;
      await crmApi.updateUserStatus(user.id, !currentActive);
      setMessage(`User ${user.fullName || user.email} status updated.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to update user status.');
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title-group">
          <h1>
            <span>Team & Permissions</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {users.length} Accounts
            </span>
          </h1>
          <p className="page-subtitle">
            Manage commercial team members, role assignments, and platform access permissions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={loadUsers}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Grid: Left = Create User Form, Right = Users List Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Create User Card */}
        <div className="crm-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <UserCog size={18} color="#2563eb" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Create New Account
            </h2>
          </div>

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Full Name
              </label>
              <input
                className="form-input"
                placeholder="e.g. Mariana Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Work Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="name@belvo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Temporary Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                System Role
              </label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="EMPLOYEE">Sales Employee (Isolated Portfolio)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={16} />
              <span>{submitting ? 'Creating...' : 'Create Account'}</span>
            </button>
          </form>
        </div>

        {/* Existing Users Table Card */}
        <div className="crm-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Active User Accounts
            </h2>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {users.filter(u => (u.isActive ?? u.is_active ?? true)).length} Active
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Loading user accounts...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No user accounts found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>User & Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const active = user.isActive ?? user.is_active ?? true;
                    const displayName = user.fullName || user.full_name || user.name || 'Unknown';
                    const initials = displayName.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();

                    return (
                      <tr key={user.id}>
                        <td style={{ color: '#94a3b8', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                          #{user.id}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: user.role === 'ADMIN' ? '#7c3aed' : '#2563eb',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                                {displayName}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: user.role === 'ADMIN' ? '#f5f3ff' : '#eff6ff',
                            color: user.role === 'ADMIN' ? '#7c3aed' : '#1d4ed8',
                            border: user.role === 'ADMIN' ? '1px solid #ddd6fe' : '1px solid #bfdbfe'
                          }}>
                            {user.role === 'ADMIN' ? '👑 Admin' : '👤 Employee'}
                          </span>
                        </td>

                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: active ? '#15803d' : '#64748b'
                          }}>
                            <span style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: active ? '#16a34a' : '#94a3b8'
                            }} />
                            {active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${active ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleStatusChange(user)}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            {active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
