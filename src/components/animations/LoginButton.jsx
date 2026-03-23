import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LoginButton({ children, loading, className, type = "button", ...props }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      onHoverStart={() => !loading && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(88, 166, 255, 0.4)' }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden btn-primary ${className || ''}`}
    >
      <span className="relative z-10 flex items-center justify-center w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner border-t-white border-l-white border-r-transparent border-b-transparent animate-spin inline-block w-4 h-4 rounded-full border-2" />
            {typeof children === 'string' && children.toLowerCase().includes('create') ? 'Creating account...' : 'Authenticating...'}
          </span>
        ) : (
          children
        )}
      </span>

      {/* Shine effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[20deg] z-0 pointer-events-none"
      />
    </motion.button>
  );
}
