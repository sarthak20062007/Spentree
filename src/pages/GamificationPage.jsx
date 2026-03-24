import { useState, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';

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
    <div className="flex flex-col" style={{ gap: '40px' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-heading)' }}>🎮 Gamification</h1>
        <p className="text-sm opacity-50 mt-2" style={{ color: 'var(--color-text-muted)' }}>Level up, earn badges, complete missions & spin the wheel!</p>
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
    <div className="bg-white/5 dark:bg-[var(--bg-grad-card)] flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 shadow-sm dark:shadow-[var(--shadow-premium)] transition-all duration-300 text-center">
      <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center animate-tree-grow text-7xl">
        {level.treeEmoji}
      </div>
      <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-heading)' }}>{level.name}</h2>
      <p className="text-sm opacity-50 text-slate-500 dark:text-slate-400">Level {level.tier}</p>
    </div>
  );
}

/* ========== Points Section ========== */
function PointsSection({ level, nextLevel, progress, points }) {
  return (
    <div className="bg-white/5 dark:bg-[var(--bg-grad-card)] p-6 rounded-2xl border border-white/10 shadow-sm dark:shadow-[var(--shadow-premium)] transition-all duration-300 flex flex-col md:flex-row items-center gap-8">
      
      <div className="shrink-0 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-blue-50/10 dark:bg-blue-900/20 flex items-center justify-center text-3xl border border-blue-100/10 dark:border-blue-800">
          {level.emoji}
        </div>
        <div>
          <p className="text-xs uppercase opacity-40 mb-1 font-label text-slate-500 dark:text-slate-400 tracking-widest">Total Balance</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{points.toLocaleString()} <span className="text-lg opacity-50 text-slate-400">PTS</span></p>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col">
        <div className="flex justify-between font-label mb-2 text-sm opacity-80">
          <span className="text-slate-600 dark:text-slate-300 font-bold">{level.name}</span>
          <span className="text-slate-400">{nextLevel ? `${nextLevel.name}` : 'Max Level'}</span>
        </div>
        <div className="h-3 bg-slate-100/10 dark:bg-[#0d1117]/50 rounded-full overflow-hidden border border-white/5 w-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between font-label mt-2 text-xs opacity-50 text-slate-500">
          <span className="text-slate-500">{points} pts</span>
          <span className="text-slate-500">
            {nextLevel ? `${nextLevel.minPoints - points} points to go` : 'Maximum achievement unlocked'}
          </span>
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
    <div className="bg-white/5 dark:bg-[var(--bg-grad-card)] p-6 rounded-2xl border border-white/10 shadow-sm dark:shadow-[var(--shadow-premium)] transition-all duration-300 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white/90">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
          Daily Missions
        </h3>
        <span className="font-label text-slate-400 text-xs">Resets in 8h 12m</span>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {missions.map(m => {
          const isClaimed = claimed.includes(m.id);
          const canClaim = m.completed && !isClaimed;
          
          return (
            <div
              key={m.id}
              className={`group flex items-center p-4 rounded-xl border transition-all duration-200 min-h-[64px] ${
                m.completed 
                  ? 'bg-slate-50/10 dark:bg-[#161b22]/30 border-slate-200/10 dark:border-[#3fb950]/30' 
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <button 
                onClick={() => canClaim && handleClaim(m)}
                disabled={!canClaim && !isClaimed}
                className={`w-6 h-6 mr-3 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                  m.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-slate-300/30 dark:border-slate-600/50 bg-transparent'
                } ${canClaim ? 'cursor-pointer hover:scale-110 shadow-lg shadow-green-500/20' : 'cursor-default'}`}
              >
                {(m.completed || isClaimed) && <span className="text-[10px] animate-badge-unlock font-bold">✓</span>}
              </button>
                
              <div className="flex-1 w-full min-w-0 pr-4">
                <div className="flex items-center justify-between mb-1 gap-4">
                  <h4 className={`font-body font-bold text-sm truncate ${m.completed ? 'text-slate-400 line-through opacity-70' : 'text-slate-200'}`}>
                    {m.title}
                  </h4>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors shrink-0">
                    {m.progress}/{m.target}
                  </span>
                </div>
                
                <div className="w-full h-2 mt-2 bg-slate-100/10 dark:bg-[#0d1117]/50 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${m.completed ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(m.progress / m.target) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="ml-auto text-right shrink-0 flex flex-col items-end pl-2 border-l border-white/5">
                <span className={`text-sm font-bold bg-[#d29922]/10 text-[#d29922] px-3 py-1.5 rounded-lg ${m.completed ? 'opacity-50' : ''}`}>
                  +{m.reward} pts
                </span>
                {isClaimed && <span className="text-[9px] text-green-500 font-bold tracking-tight uppercase mt-1">Claimed</span>}
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
    <div className="bg-white/5 dark:bg-[var(--bg-grad-card)] p-6 rounded-2xl border border-white/10 shadow-sm dark:shadow-[var(--shadow-premium)] transition-all duration-300 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white/90">
          <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
          Achievement Gallery
        </h3>
        <span className="font-label text-slate-400 text-sm font-bold opacity-60 bg-white/5 px-3 py-1 border border-white/10 rounded-lg">{earnedBadges.length}/{badges.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {badges.map(badge => {
          const earned = earnedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`group flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 ${
                earned 
                  ? 'bg-slate-50/10 dark:bg-[#161b22]/30 border-[#58a6ff]/20 shadow-sm hover:border-[#58a6ff]/40' 
                  : 'bg-white/5 dark:bg-[#0d1117]/50 border border-white/10 opacity-60'
              }`}
            >
              <div className={`text-3xl mb-2 transition-transform duration-500 group-hover:scale-110 ${earned ? 'animate-badge-pop' : 'grayscale blur-[2px] opacity-40'}`}>
                {earned ? badge.icon : '🔒'}
              </div>
              <p className={`font-label text-xs font-bold leading-tight ${earned ? 'text-slate-200' : 'text-slate-400'}`}>
                {badge.name}
              </p>
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
    <div className="bg-white/5 dark:bg-[var(--bg-grad-card)] p-6 rounded-2xl border border-white/10 shadow-sm dark:shadow-[var(--shadow-premium)] transition-all duration-300 text-center">
      <div className="flex items-center justify-center gap-3 mb-8">
        <h3 className="font-page-title text-xl" style={{ color: 'var(--color-text-heading)' }}>🎰 Daily Bonus Spin</h3>
      </div>

      <div className="relative inline-block mb-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 text-3xl text-slate-800 dark:text-slate-200">
          ▼
        </div>

        <div
          ref={wheelRef}
          className="w-64 h-64 md:w-72 md:h-72 rounded-full relative border-8 border-slate-100/10 dark:border-[#30363d] shadow-lg overflow-hidden"
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
          <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-[#1c2128] border-4 border-slate-100/10 dark:border-[#30363d] shadow-md z-10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {prize && (
        <div className="mb-8 p-4 bg-blue-50/10 dark:bg-blue-900/20 border border-blue-100/20 dark:border-blue-800 rounded-xl animate-scale-in">
          <p className="font-body font-bold text-blue-400 dark:text-blue-300">🎉 Congratulations! You won {prize.label}</p>
        </div>
      )}

      <button
        onClick={handleSpin}
        disabled={!canSpin || spinning || hasSpun}
        className="btn-primary !px-12 !py-4 font-body !font-bold w-full max-w-xs mx-auto block disabled:opacity-50"
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
    <div className="bg-white/5 dark:bg-[var(--bg-grad-card)] p-6 rounded-2xl border border-white/10 shadow-sm dark:shadow-[var(--shadow-premium)] transition-all duration-300 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white/90">
          <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
          Global Leaderboard
        </h3>
      </div>
      <div className="overflow-hidden border border-white/5 dark:border-[#30363d] rounded-xl bg-white/5">
        <table className="w-full font-body border-collapse">
          <thead>
            <tr className="bg-white/5 dark:bg-[#161b22]/50 border-b border-white/10 dark:border-[#30363d]">
              <th className="text-left py-4 px-6 font-bold text-white/40 text-xs uppercase tracking-wider">Rank</th>
              <th className="text-left py-4 px-6 font-bold text-white/40 text-xs uppercase tracking-wider">Player</th>
              <th className="text-left py-4 px-6 font-bold text-white/40 text-xs uppercase tracking-wider h-full hidden sm:table-cell">Expertise</th>
              <th className="text-right py-4 px-6 font-bold text-white/40 text-xs uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 dark:divide-[#30363d]">
            {leaderboard.map((entry, i) => (
              <tr
                key={entry.username}
                className={`transition-all duration-200 ${entry.isCurrentUser ? 'bg-blue-500/10 dark:bg-blue-900/10' : 'hover:bg-white/5 dark:hover:bg-[#21262d]'}`}
              >
                <td className="py-4 px-6 w-16">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border border-white/10 ${
                    i === 0 ? 'bg-amber-500/20 text-amber-500' : 
                    i === 1 ? 'bg-slate-300/20 text-slate-300' : 
                    i === 2 ? 'bg-orange-500/20 text-orange-500' : 
                    'text-slate-400 bg-white/5'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200">
                      {entry.username}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full font-bold tracking-widest">YOU</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 hidden sm:table-cell">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-base">{entry.emoji}</span>
                    <span className="text-sm">{entry.level}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="font-bold text-blue-400">
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
