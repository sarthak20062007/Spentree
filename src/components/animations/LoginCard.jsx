import { motion } from 'framer-motion';

export default function LoginCard({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
      className={`bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-[var(--shadow-premium)] border border-slate-100 dark:border-[#30363d] relative overflow-hidden ${className || ''}`}
    >
      {/* Subtle border highlight that moves */}
      <motion.div 
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#58a6ff] to-transparent opacity-50"
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 100%' }}
      />
      {children}
    </motion.div>
  );
}
