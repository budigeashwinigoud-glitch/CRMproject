import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import crmApi from '../services/api';
import { useCRM } from '../context/CRMContext';

function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await crmApi.login(email.trim(), password);
      setCurrentUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '80px auto',
      padding: 24,
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #e2e8f0',
      borderRadius: 12
    }}>
      <h1>Belvo CRM</h1>
      <p>Sign in to your account</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            padding: 10,
            margin: '8px 0 16px'
          }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            padding: 10,
            margin: '8px 0 16px'
          }}
        />

        {error && (
          <p style={{ color: '#dc2626' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

