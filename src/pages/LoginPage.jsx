import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import AuroraBackground from '../components/animations/AuroraBackground';

export default function LoginPage() {
  const { login, register, loginWithGoogle } = useApp();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  // Login fields
  const [loginGmail, setLoginGmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regGmail, setRegGmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginGmail.trim().toLowerCase(), loginPassword);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({
      gmail: regGmail.trim().toLowerCase(),
      username: regUsername.trim(),
      password: regPassword,
    });
    setLoading(false);
    if (result.success) setIsRegister(false);
    else setError(result.message);
  };

  return (
    <AuroraBackground>
      <div className="relative min-h-screen flex items-center justify-center p-4 w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[420px]"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="flex items-center justify-center mb-4"
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '12px'
              }}
            >
              <span style={{ fontSize: '26px', lineHeight: '1' }}>🌳</span>
            </div>
            <h1 className="text-white font-bold tracking-wide" style={{ fontSize: '24px', marginBottom: '4px' }}>
              Spentree
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: '400' }}>
              Track your finances, grow your wealth
            </p>
          </div>

          <h2 className="text-center text-white font-medium text-lg mb-6 tracking-wide">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 text-red-200 p-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-500/30 backdrop-blur-md"
              >
                <span>⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="flex flex-col gap-[16px]">
            
            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '500' }}>
                Gmail Address
              </label>
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:border-white/50 placeholder-white/50" 
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '14px 16px',
                  fontSize: '15px'
                }}
                value={isRegister ? regGmail : loginGmail} 
                onChange={e => isRegister ? setRegGmail(e.target.value) : setLoginGmail(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '500' }}>
                  Username
                </label>
                <input 
                  type="text" 
                  placeholder="Your name"
                  className="w-full outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:border-white/50 placeholder-white/50" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '14px 16px',
                    fontSize: '15px'
                  }}
                  value={regUsername} 
                  onChange={e => setRegUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '500' }}>
                Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:border-white/50 placeholder-white/50 tracking-widest"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '14px 16px',
                  fontSize: '15px'
                }}
                value={isRegister ? regPassword : loginPassword} 
                onChange={e => isRegister ? setRegPassword(e.target.value) : setLoginPassword(e.target.value)}
                required
              />
            </div>

            <motion.button 
              whileHover={{ filter: 'brightness(1.15)', scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-white font-bold transition-all duration-300 mt-2 flex items-center justify-center cursor-pointer shadow-xl shadow-green-900/20"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f, #22c55e)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '16px'
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
            </motion.button>

            {/* Google Sign In Option */}
            <div className="relative flex items-center py-1 mt-1 opacity-70">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink-0 mx-4 text-white/60 text-[11px] font-semibold tracking-wider uppercase">OR</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <motion.button 
              type="button"
              whileHover={{ background: 'rgba(255, 255, 255, 0.15)', scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                setLoading(true);
                const res = await loginWithGoogle();
                setLoading(false);
                if (res.success) navigate('/dashboard');
                else setError(res.message);
              }}
              className="w-full flex items-center justify-center gap-3 text-white font-medium transition-all duration-300 cursor-pointer shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '15px'
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google" />
              Sign in with Google
            </motion.button>
          </form>

          <div className="text-center mt-8">
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              {isRegister ? 'Already have an account? ' : 'New to Spentree? '} 
            </span>
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium hover:underline transition-all cursor-pointer tracking-wide"
              style={{ color: '#22c55e', fontSize: '14px' }}
            >
              {isRegister ? 'Login' : 'Sign up'}
            </button>
          </div>
          
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
