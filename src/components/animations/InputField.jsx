import { motion } from 'framer-motion';

export default function InputField(props) {
  return (
    <motion.input
      {...props}
      whileFocus={{ 
        boxShadow: '0 0 16px rgba(88, 166, 255, 0.3)',
        scale: 1.01 
      }}
      transition={{ duration: 0.2 }}
      className={`input-field ${props.className || ''}`}
    />
  );
}
