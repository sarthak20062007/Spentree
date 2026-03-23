import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/animations/AuroraBackground';

export default function LoginPage() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  // Login fields
  const [loginGmail, setLoginGmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regGmail, setRegGmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!loginGmail.trim()) { setError('Please enter your Gmail'); return; }
    if (!isValidEmail(loginGmail.trim())) { setError('Please enter a valid Gmail address'); return; }
    if (!loginPassword.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    setTimeout(() => {
      const result = login(loginGmail.trim().toLowerCase(), loginPassword);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }, 500);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!regGmail.trim()) { setError('Please enter your Gmail'); return; }
    if (!isValidEmail(regGmail.trim())) { setError('Please enter a valid Gmail address'); return; }
    if (!regUsername.trim()) { setError('Please enter a username'); return; }
    if (regUsername.trim().length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!regPassword.trim()) { setError('Please enter a password'); return; }
    if (regPassword.length < 4) { setError('Password must be at least 4 characters'); return; }
    if (regPassword !== regConfirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        gmail: regGmail.trim().toLowerCase(),
        username: regUsername.trim(),
        password: regPassword,
      });
      setLoading(false);
      if (result.success) {
        setRegGmail('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
        setIsRegister(false);
        setLoginGmail(regGmail.trim().toLowerCase());
        setLoginPassword('');
        setSuccess('✅ Account created! Please login.');
      } else {
        setError(result.message);
      }
    }, 600);
  };

  const switchTab = (toRegister) => {
    setIsRegister(toRegister);
    setError('');
    setSuccess('');
  };

  // Shared input style
  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#fff',
    padding: '14px 16px',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.6)';
    e.target.style.boxShadow = '0 0 12px rgba(255,255,255,0.15)';
  };
  const inputBlurHandler = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
    e.target.style.boxShadow = 'none';
  };

  const labelStyle = {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center mx-auto mb-4"
            style={{
              width: '50px',
              height: '50px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <span className="text-2xl">🌳</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Spentree</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Track your finances, grow your wealth
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2
            className="text-center mb-6"
            style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}
          >
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Messages */}
          {success && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Forms */}
          {!isRegister ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Gmail Address</label>
                <input
                  type="email"
                  value={loginGmail}
                  onChange={(e) => setLoginGmail(e.target.value)}
                  style={inputStyle}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #1e3a5f, #22c55e)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.filter = 'brightness(1.15)'; }}
                onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Gmail Address</label>
                <input
                  type="email"
                  value={regGmail}
                  onChange={(e) => setRegGmail(e.target.value)}
                  style={inputStyle}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  required
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. John Doe"
                  autoComplete="username"
                  required
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #1e3a5f, #22c55e)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.filter = 'brightness(1.15)'; }}
                onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Switch link */}
          <p
            className="text-center mt-6"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}
          >
            {isRegister ? 'Already have an account? ' : 'New to Spentree? '}
            <button
              onClick={() => switchTab(!isRegister)}
              style={{
                color: '#22c55e',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isRegister ? 'Login' : 'Sign up'}
            </button>
          </p>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
