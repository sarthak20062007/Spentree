import { motion } from 'framer-motion';
import Aurora from './Aurora';

export default function AuroraBackground({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d1117] dark:bg-[#0d1117] transition-colors duration-500 overflow-hidden">
      {/* React Bits Aurora - WebGL shader background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF9484", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={1.0}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
