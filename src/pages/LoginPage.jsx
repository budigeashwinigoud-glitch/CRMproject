import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import crmApi from '../services/api';
import { useCRM } from '../context/CRMContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await crmApi.login(email.trim(), password);
      setCurrentUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090e1a',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #090e1a 70%)',
      padding: '24px',
      fontFamily: 'var(--font-sans, "Plus Jakarta Sans", sans-serif)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Top Header Card */}
        <div style={{
          padding: '32px 32px 24px',
          borderBottom: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 6px -1px rgb(15 23 42 / 0.2)'
          }}>
            <Shield size={24} strokeWidth={2.2} color="#38bdf8" />
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px',
            letterSpacing: '-0.02em'
          }}>
            Belvo CRM
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: 0
          }}>
            Internal CRM & Lead Intelligence Platform
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: 6
                }}
              >
                Work Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="name@belvo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 36px',
                    fontSize: '0.875rem',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: 6
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 36px',
                    fontSize: '0.875rem',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background-color 0.15s ease, transform 0.05s ease',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1e293b'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0f172a'; }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Helper Pills */}
          <div style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              Quick-Fill Test Credentials
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => fillCredentials('admin@belvo.com', 'Admin@12345')}
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#1e293b' }}>
                  👑 Admin
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  admin@belvo.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('ashwini@belvo.com', 'Ashwini@12345')}
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#1e293b' }}>
                  👤 Employee
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  ashwini@belvo.com
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
