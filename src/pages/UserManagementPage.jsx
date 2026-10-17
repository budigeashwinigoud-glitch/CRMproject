import React, { useEffect, useState } from 'react';
import { crmApi } from '../services/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const data = await crmApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
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

    try {
      await crmApi.createUser({
        full_name: fullName,
        email,
        password,
        role,
        is_active: true
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setRole('EMPLOYEE');
      setMessage('User created successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to create user.');
    }
  }

  async function handleStatusChange(user) {
    setError('');
    setMessage('');

    try {
    
      await crmApi.updateUserStatus(
      user.id,
      !(user.isActive ?? user.is_active)
      );
      setMessage('User status updated.');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to update user status.');
    }
  }

  return (
    <div style={{ padding: '28px', maxWidth: '1100px' }}>
      <h1>User Management</h1>
      <p>View employee accounts and manage user access.</p>

      {error && (
        <p style={{ color: '#dc2626' }}>{error}</p>
      )}
      {message && (
        <p style={{ color: '#15803d' }}>{message}</p>
      )}

      <section style={{
        padding: '20px',
        margin: '24px 0',
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}>
        <h2>Create User</h2>

        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: '12px' }}>
            <label>Full name</label><br />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Temporary password</label><br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Role</label><br />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '10px' }}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit">Create User</button>
        </form>
      </section>

      <section>
        <h2>Existing Users</h2>

        <button type="button" onClick={loadUsers}>
          Refresh Users
        </button>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: '10px' }}>{user.id}</td>
                    
                    
                    <td style={{ padding: '10px' }}>
                    
                    {user.fullName || user.full_name || user.name || 'Unknown'}
                    </td>

                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px' }}>{user.role}</td>
                    <td style={{ padding: '10px' }}>
                    
                      {(user.isActive ?? user.is_active) ? 'Active' : 'Inactive'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(user)}

                      >
                        
                        {(user.isActive ?? user.is_active) ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
