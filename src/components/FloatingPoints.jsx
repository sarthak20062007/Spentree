import { useApp } from '../context/AppContext';

export default function FloatingPoints() {
  const { floatingPoints } = useApp();

  if (floatingPoints.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {floatingPoints.map(fp => (
        <div
          key={fp.id}
          className="absolute animate-float-up font-extrabold text-[32px] tracking-wide"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#22c55e',
            textShadow: '0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.3)',
          }}
        >
          +{fp.pts} pts
        </div>
      ))}
    </div>
  );
}
