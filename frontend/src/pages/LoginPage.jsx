import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import crmApi from '../services/api';
import { useCRM } from '../context/CRMContext';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050814',
        padding: '24px',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* Liquid Organic Gradient Blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(37, 99, 235, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'liquidBlobOne 14s infinite ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '8%',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)',
          filter: 'blur(80px)',
          animation: 'liquidBlobTwo 18s infinite ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '40%',
          right: '25%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0) 70%)',
          filter: 'blur(65px)',
          animation: 'liquidBlobThree 12s infinite ease-in-out',
          pointerEvents: 'none'
        }}
      />

      {/* Subtle Mesh Grid Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
          pointerEvents: 'none'
        }}
      />

      {/* Glassmorphic Liquid Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        {/* Iridescent Top Accent Bar */}
        <div
          style={{
            height: 3,
            width: '100%',
            background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)'
          }}
        />

        {/* Card Header */}
        <div
          style={{
            padding: '36px 32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Belvo Official Logo */}
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
            <img
              src="/belvo-logo-dark.png"
              alt="Belvo Logo"
              style={{
                width: 130,
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 18px rgba(168, 85, 247, 0.35))'
              }}
            />
          </div>

          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 6px',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            Belvo <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '1.1rem' }}>CRM</span>
          </h1>
          <p
            style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
              margin: 0,
              fontWeight: 500
            }}
          >
            Enterprise Lead Management & Sales Intelligence
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: '28px 32px 32px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                backdropFilter: 'blur(12px)',
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Work Email */}
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginBottom: 8,
                  letterSpacing: '0.01em'
                }}
              >
                Work Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@belvo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px 12px 40px',
                    fontSize: '0.875rem',
                    color: '#f8fafc',
                    borderRadius: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.25), inset 0 1px 2px rgba(0,0,0,0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.3)';
                  }}
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.01em'
                  }}
                >
                  Password
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Enterprise SSO Active
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 42px 12px 40px',
                    fontSize: '0.875rem',
                    color: '#f8fafc',
                    borderRadius: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.25), inset 0 1px 2px rgba(0,0,0,0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.3)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Liquid Shimmer Primary Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px 20px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #0284c7 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 12,
                fontSize: '0.925rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
                opacity: loading ? 0.8 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(37, 99, 235, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.45)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(37, 99, 235, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)';
                }
              }}
            >
              <span>{loading ? 'Authenticating Session...' : 'Sign In to Workspace'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Secure Zero-Trust Notice (No visible plaintext credentials) */}
          <div
            style={{
              marginTop: 26,
              paddingTop: 20,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                fontSize: '0.72rem',
                color: '#94a3b8',
                fontWeight: 600
              }}
            >
              <Lock size={12} color="#10b981" />
              <span>256-Bit SSL Encrypted • Zero-Trust Security</span>
            </div>
            <p
              style={{
                fontSize: '0.7rem',
                color: '#64748b',
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.4
              }}
            >
              Authorized Belvo team access only. All authentication attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
