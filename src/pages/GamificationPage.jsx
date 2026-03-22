import { useState, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  calculateLevel, getNextLevel, getLevelProgress,
  getAllBadges, getLeaderboard,
  SPIN_PRIZES, getRandomPrize,
} from '../utils/gamification';
import { playSpinSound } from '../utils/sounds';
import confetti from 'canvas-confetti';

export default function GamificationPage() {
  const { user, transactions, dailyMissions, completeMission, spinWheel, addNotification } = useApp();

  const level = calculateLevel(user.points);
  const nextLevel = getNextLevel(user.points);
  const progress = getLevelProgress(user.points);
  const badges = getAllBadges();
  const completedMissionExists = dailyMissions.some(m => m.completed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-page-title" style={{ color: 'var(--color-text-heading)' }}>🎮 Gamification</h1>
        <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>Level up, earn badges, complete missions & spin the wheel!</p>
      </div>

      {/* Avatar Section */}
      <AvatarSection level={level} nextLevel={nextLevel} progress={progress} points={user.points} />

      {/* Points & Level */}
      <PointsSection level={level} nextLevel={nextLevel} progress={progress} points={user.points} />

      {/* Daily Missions */}
      <MissionsSection missions={dailyMissions} completeMission={completeMission} transactions={transactions} />

      {/* Badges */}
      <BadgesSection badges={badges} earnedBadges={user.badges} />

      {/* Spin Wheel */}
      <SpinWheelSection
        canSpin={completedMissionExists}
        onSpin={spinWheel}
      />

      {/* Leaderboard */}
      <LeaderboardSection user={user} />
    </div>
  );
}

/* ========== Avatar Section ========== */
function AvatarSection({ level }) {
  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 border border-slate-200 dark:border-[#30363d] shadow-sm text-center">
      <div className="relative inline-block">
        <div className="text-[6rem] leading-none mb-4 animate-tree-grow">
          {level.treeEmoji}
        </div>
      </div>
      <h2 className="font-page-title text-2xl" style={{ color: 'var(--color-text-heading)' }}>{level.name}</h2>
      <p className="font-body text-slate-500 dark:text-slate-400 mt-1">Level {level.tier}</p>
    </div>
  );
}

/* ========== Points Section ========== */
function PointsSection({ level, nextLevel, progress, points }) {
  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 border border-slate-200 dark:border-[#30363d] shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-4xl border border-blue-100 dark:border-blue-800 shadow-sm">
            {level.emoji}
          </div>
          <div>
            <p className="font-label text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Balance</p>
            <p className="font-card-value text-slate-900 dark:text-white" style={{ fontSize: '36px' }}>{points.toLocaleString()} <span className="text-xl text-slate-400">PTS</span></p>
          </div>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="flex justify-between font-label mb-3">
            <span className="text-slate-600 dark:text-slate-300 font-bold">{level.name}</span>
            <span className="text-slate-400">{nextLevel ? `${nextLevel.name}` : 'Max Level'}</span>
          </div>
          <div className="h-4 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-[#30363d]">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="flex justify-between font-label mt-3">
            <span className="text-slate-500">{points} pts</span>
            <span className="text-slate-500">
              {nextLevel ? `${nextLevel.minPoints - points} points to go` : 'Maximum achievement unlocked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== Daily Missions ========== */
function MissionsSection({ missions, completeMission }) {
  const [claimed, setClaimed] = useState([]);

  const handleClaim = (mission) => {
    if (claimed.includes(mission.id)) return;
    completeMission(mission.id, mission.reward);
    setClaimed(prev => [...prev, mission.id]);
  };

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 border border-slate-200 dark:border-[#30363d] shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xl border border-indigo-100 dark:border-indigo-800">
            🎯
          </div>
          <h3 className="font-page-title text-xl" style={{ color: 'var(--color-text-heading)' }}>Daily Missions</h3>
        </div>
        <span className="font-label text-slate-400 text-sm">Resets in 8h 12m</span>
      </div>

      <div className="space-y-4">
        {missions.map(m => {
          const isClaimed = claimed.includes(m.id);
          const canClaim = m.completed && !isClaimed;
          
          return (
            <div
              key={m.id}
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                m.completed 
                  ? 'bg-slate-50/50 dark:bg-[#161b22]/30 border-slate-200 dark:border-[#30363d]' 
                  : 'bg-white dark:bg-[#1c2128] border-slate-100 dark:border-[#30363d] hover:border-slate-200 dark:hover:border-[#30363d]'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => canClaim && handleClaim(m)}
                  disabled={!canClaim && !isClaimed}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                    m.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 dark:border-slate-600 bg-transparent'
                  } ${canClaim ? 'cursor-pointer hover:scale-110 shadow-lg shadow-green-500/20' : 'cursor-default'}`}
                >
                  {(m.completed || isClaimed) && <span className="text-[10px] animate-badge-unlock">✓</span>}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-body font-bold transition-colors ${m.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {m.title}
                    </h4>
                    {canClaim && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                        READY TO CLAIM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden max-w-[120px]">
                      <div 
                        className={`h-full transition-all duration-500 ${m.completed ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${(m.progress / m.target) * 100}%` }} 
                      />
                    </div>
                    <span className="text-[11px] font-label text-slate-400">{m.progress}/{m.target}</span>
                  </div>
                </div>
              </div>

              <div className="text-right ml-4">
                <p className={`font-bold font-body ${m.completed ? 'text-slate-300' : 'text-amber-500'}`}>+{m.reward} pts</p>
                {isClaimed && <p className="text-[10px] text-green-500 font-bold tracking-tight uppercase mt-0.5">Claimed</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== Badges ========== */
function BadgesSection({ badges, earnedBadges }) {
  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 border border-slate-200 dark:border-[#30363d] shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-xl border border-amber-100 dark:border-amber-800">
            🏅
          </div>
          <h3 className="font-page-title text-xl" style={{ color: 'var(--color-text-heading)' }}>Achievement Gallery</h3>
        </div>
        <span className="font-label text-slate-400 text-sm">{earnedBadges.length}/{badges.length} Unlocked</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {badges.map(badge => {
          const earned = earnedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`group flex flex-col items-center p-4 rounded-xl border transition-all duration-500 ${
                earned 
                  ? 'bg-slate-50 dark:bg-[#161b22]/50 border-slate-200 dark:border-[#30363d] hover:shadow-md' 
                  : 'bg-white dark:bg-[#1c2128] border-slate-100 dark:border-[#30363d] opacity-60'
              }`}
            >
              <div className={`text-4xl mb-3 transition-transform duration-500 group-hover:scale-110 ${earned ? 'animate-badge-pop' : 'grayscale blur-[2px] opacity-40'}`}>
                {earned ? badge.icon : '🔒'}
              </div>
              <p className={`font-label text-xs font-bold text-center mb-1 ${earned ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                {badge.name}
              </p>
              {earned && (
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tighter">Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== Spin Wheel ========== */
const CORPORATE_COLORS = ['#3b82f6', '#1e40af', '#0ea5e9', '#0369a1', '#10b981', '#059669', '#6366f1', '#4338ca'];

function SpinWheelSection({ canSpin, onSpin }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef(null);

  const handleSpin = useCallback(() => {
    if (spinning || hasSpun) return;
    setSpinning(true);
    setPrize(null);

    const selectedPrize = getRandomPrize();
    const prizeIndex = SPIN_PRIZES.indexOf(SPIN_PRIZES.find(p => p.label === selectedPrize.label));
    const segmentAngle = 360 / SPIN_PRIZES.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + 1440 + targetAngle;

    playSpinSound();
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setPrize(selectedPrize);
      setHasSpun(true);
      onSpin(selectedPrize);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#6366f1'],
      });
    }, 4000);
  }, [spinning, hasSpun, rotation, onSpin]);

  const segmentAngle = 360 / SPIN_PRIZES.length;

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 border border-slate-200 dark:border-[#30363d] shadow-sm text-center">
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl border border-blue-100 dark:border-blue-800">
          🎰
        </div>
        <h3 className="font-page-title text-xl" style={{ color: 'var(--color-text-heading)' }}>Daily Bonus Spin</h3>
      </div>

      <div className="relative inline-block mb-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 text-3xl text-slate-800 dark:text-slate-200">
          ▼
        </div>

        <div
          ref={wheelRef}
          className="w-64 h-64 md:w-72 md:h-72 rounded-full relative border-8 border-slate-100 dark:border-[#30363d] shadow-lg overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none',
            background: `conic-gradient(${SPIN_PRIZES.map((p, i) => `${CORPORATE_COLORS[i % CORPORATE_COLORS.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ')})`,
          }}
        >
          {SPIN_PRIZES.map((p, i) => {
            const angle = i * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className="absolute font-label font-bold text-white text-xs tracking-tight"
                  style={{
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1c2128] border-4 border-slate-100 dark:border-[#30363d] shadow-md z-10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {prize && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl animate-scale-in">
          <p className="font-body font-bold text-blue-700 dark:text-blue-300">🎉 Congratulations! You won {prize.label}</p>
        </div>
      )}

      <button
        onClick={handleSpin}
        disabled={!canSpin || spinning || hasSpun}
        className="btn-primary !px-12 !py-4 font-body !font-bold w-full max-w-xs mx-auto block"
      >
        {spinning ? '🌀 Spinning...' : hasSpun ? '✓ Already Claimed Today' : canSpin ? '🎰 Spin and Win' : '🔒 Mission Required to Spin'}
      </button>
    </div>
  );
}

/* ========== Leaderboard ========== */
function LeaderboardSection({ user }) {
  const leaderboard = useMemo(() => getLeaderboard(user), [user]);

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 border border-slate-200 dark:border-[#30363d] shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-xl border border-green-100 dark:border-green-800">
          🏆
        </div>
        <h3 className="font-page-title text-xl" style={{ color: 'var(--color-text-heading)' }}>Global Leaderboard</h3>
      </div>
      <div className="overflow-hidden border border-slate-100 dark:border-[#30363d] rounded-xl">
        <table className="w-full font-body border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-bottom border-slate-100 dark:border-slate-800">
              <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">Rank</th>
              <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">Player</th>
              <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">Expertise</th>
              <th className="text-right py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {leaderboard.map((entry, i) => (
              <tr
                key={entry.username}
                className={`transition-colors ${entry.isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-[#161b22]/30'}`}
              >
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : 
                    i === 1 ? 'bg-slate-100 text-slate-700' : 
                    i === 2 ? 'bg-orange-100 text-orange-700' : 
                    'text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {entry.username}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">YOU</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="text-base">{entry.emoji}</span>
                    <span className="text-sm">{entry.level}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {entry.points.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
