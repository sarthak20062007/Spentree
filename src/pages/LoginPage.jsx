import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  const { login, register } = useApp();
  const { theme } = useTheme();
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
        setSuccess('✅ Account created successfully! Please login with your credentials.');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[440px] px-6 py-12">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-6">
            <span className="text-3xl text-white">🌳</span>
          </div>
          <h1 className="font-page-title text-3xl text-slate-900 dark:text-white mb-2">Spentree</h1>
          <p className="font-body text-slate-500 dark:text-slate-400">Securely manage your personal financial growth.</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <h2 className="font-card-title text-xl text-slate-800 dark:text-white mb-8 text-center uppercase tracking-wide">
            {isRegister ? 'Account Registration' : 'Member Login'}
          </h2>

          {/* Messages */}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm font-body mb-6">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-body mb-6 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block font-label text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gmail Address</label>
                <input
                  type="email"
                  value={loginGmail}
                  onChange={e => setLoginGmail(e.target.value)}
                  className="input-field"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-label text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full py-4 font-bold shadow-lg shadow-blue-500/25" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Authenticating...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block font-label text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gmail Address</label>
                <input
                  type="email"
                  value={regGmail}
                  onChange={e => setRegGmail(e.target.value)}
                  className="input-field"
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="block font-label text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  className="input-field"
                  placeholder="e.g. John Doe"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="block font-label text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Create Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="block font-label text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full py-4 font-bold shadow-lg shadow-blue-500/25 mt-4" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Toggle Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="font-body text-sm text-slate-500 dark:text-slate-400">
              {isRegister ? 'Already using Spentree?' : "New to Spentree?"}{' '}
              <button
                onClick={() => switchTab(!isRegister)}
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isRegister ? 'Login here' : 'Sign up for free'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-10 text-center font-label text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
          High-Security Financial Monitoring
        </p>
      </div>
    </div>
  );
}
