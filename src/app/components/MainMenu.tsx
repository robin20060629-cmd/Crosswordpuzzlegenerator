import { useState } from 'react';
import { GameMode, PlayerState, ACHIEVEMENTS, getLevelName, xpForLevel, Achievement } from './pool/types';

interface Props {
  player: PlayerState;
  onStart: (mode: GameMode, p1: PlayerState, p2: PlayerState) => void;
}

export default function MainMenu({ player, onStart }: Props) {
  const [activeTab, setActiveTab] = useState<'menu' | 'achievements' | 'leaderboard'>('menu');
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);

  const xpNeeded = xpForLevel(player.level + 1);
  const xpPct = Math.round((player.xp / xpNeeded) * 100);

  const modes: { key: GameMode; label: string; sublabel: string; icon: string; color: string }[] = [
    { key: 'training', label: 'Training', sublabel: 'Боттой тоглож дадлага хийнэ', icon: '🤖', color: 'from-emerald-900/40 to-emerald-800/20 border-emerald-600/30 hover:border-emerald-400/60' },
    { key: 'classic', label: 'Classic', sublabel: 'Ижил түвшний тоглогчтой онлайн', icon: '🌐', color: 'from-blue-900/40 to-blue-800/20 border-blue-600/30 hover:border-blue-400/60' },
    { key: 'invite', label: 'Invite', sublabel: 'Найздаа урилга илгээж тоглоно', icon: '📨', color: 'from-purple-900/40 to-purple-800/20 border-purple-600/30 hover:border-purple-400/60' },
  ];

  const handleMode = (mode: GameMode) => {
    const p1: PlayerState = { ...player };
    let p2: PlayerState;

    if (mode === 'training') {
      p2 = {
        name: 'BOT',
        group: null, isAI: true,
        coins: 0, xp: 0, level: 5,
        wins: 0, achievements: [],
      };
    } else if (mode === 'classic') {
      p2 = {
        name: 'Player 2',
        group: null, isAI: false,
        coins: 200, xp: 50, level: 3,
        wins: 2, achievements: [],
      };
    } else {
      p2 = {
        name: 'Friend',
        group: null, isAI: false,
        coins: 100, xp: 30, level: 2,
        wins: 1, achievements: [],
      };
    }

    onStart(mode, p1, p2);
  };

  const leaderboard = [
    { name: 'PoolMaster_MN', level: 48, wins: 382, coins: 14200 },
    { name: 'Сарнай_99', level: 35, wins: 241, coins: 9800 },
    { name: 'BilliardPro', level: 28, wins: 189, coins: 7600 },
    { name: player.name, level: player.level, wins: player.wins, coins: player.coins },
    { name: 'Beginner_01', level: 3, wins: 12, coins: 650 },
  ].sort((a, b) => b.wins - a.wins);

  return (
    <div className="min-h-screen bg-[#0a0704] flex flex-col items-center justify-start py-6 px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex flex-col items-center gap-1 mb-6">
          {/* Pool table decorative header */}
          <div className="relative w-full max-w-md h-16 rounded-lg overflow-hidden mb-2"
            style={{ background: 'linear-gradient(135deg, #5C3318 0%, #3D2010 50%, #5C3318 100%)' }}>
            <div className="absolute inset-[8px] rounded"
              style={{ background: 'linear-gradient(135deg, #0E8055 0%, #0B6E4F 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-['Oswald',sans-serif] text-[#F4B400] text-3xl tracking-[0.3em] font-bold drop-shadow-lg">
                  8 BALL POOL
                </span>
              </div>
              {/* Decorative balls */}
              {[1,3,5,8,9,13].map((n, i) => (
                <div key={n} className="absolute w-5 h-5 rounded-full border border-white/10"
                  style={{
                    left: `${8 + i * 14}%`,
                    top: '50%', transform: 'translateY(-50%)',
                    background: getBallBg(n),
                    opacity: 0.7,
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* Player card */}
        <div className="border border-neutral-700/60 bg-neutral-900/80 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F4B400] to-yellow-600 flex items-center justify-center text-black font-['Oswald',sans-serif] text-xl font-bold">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-['Oswald',sans-serif] text-white text-lg">{player.name}</span>
                <span className="text-xs text-neutral-400 font-['JetBrains_Mono',monospace]">
                  Lv {player.level} · {getLevelName(player.level)}
                </span>
              </div>
              <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-gradient-to-r from-[#F4B400] to-yellow-300 transition-all duration-700"
                  style={{ width: `${xpPct}%` }} />
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span className="font-['JetBrains_Mono',monospace]">{player.xp}/{xpNeeded} XP</span>
                <span className="text-[#F4B400]">🪙 {player.coins}</span>
                <span>🏆 {player.wins} wins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border border-neutral-700/50 rounded-lg overflow-hidden mb-4">
          {(['menu', 'achievements', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-['Oswald',sans-serif] tracking-wider uppercase transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-[#F4B400]/15 text-[#F4B400] border-b-2 border-[#F4B400]'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
              }`}
            >
              {tab === 'menu' ? '🎱 Тоглоом' : tab === 'achievements' ? '🏅 Achievement' : '📊 Leaderboard'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-3">
            {modes.map(m => (
              <button
                key={m.key}
                onClick={() => handleMode(m.key)}
                onMouseEnter={() => setHoveredMode(m.key)}
                onMouseLeave={() => setHoveredMode(null)}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-xl border bg-gradient-to-r
                  transition-all duration-200 text-left
                  ${m.color}
                  ${hoveredMode === m.key ? 'scale-[1.01] shadow-lg' : ''}
                `}
              >
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="font-['Oswald',sans-serif] text-white text-lg tracking-wide">{m.label}</div>
                  <div className="text-neutral-400 text-xs">{m.sublabel}</div>
                </div>
                <span className="text-neutral-500 text-lg">›</span>
              </button>
            ))}

            {/* Exit */}
            <button
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-red-900/30 bg-gradient-to-r from-red-950/30 to-red-900/10 hover:border-red-700/50 transition-all duration-200 text-left mt-1"
            >
              <span className="text-2xl">🚪</span>
              <div className="flex-1">
                <div className="font-['Oswald',sans-serif] text-red-400 text-lg tracking-wide">Exit</div>
                <div className="text-neutral-500 text-xs">Тоглоомноос гарна</div>
              </div>
            </button>

            {/* Quick rules */}
            <div className="border border-neutral-800 bg-neutral-900/50 rounded-xl p-4 mt-1">
              <div className="font-['Oswald',sans-serif] text-[#F4B400] text-sm mb-2 tracking-wider">ТОГЛООМЫН ДҮРЭМ</div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-400">
                <Rule icon="🎯" text="Solid 1–7 эсвэл Stripe 9–15 сонго" />
                <Rule icon="⚪" text="Цагаан халаасанд орвол Foul" />
                <Rule icon="🎱" text="Бүгдийг оруулаад 8-г оруул" />
                <Rule icon="❌" text="8-г эрт оруулвал ялагдана" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = player.achievements.includes(ach.id);
              return (
                <AchievementCard key={ach.id} achievement={ach} unlocked={unlocked} />
              );
            })}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                  entry.name === player.name
                    ? 'border-[#F4B400]/40 bg-[#F4B400]/8'
                    : 'border-neutral-700/40 bg-neutral-900/50'
                }`}
              >
                <span className={`font-['Oswald',sans-serif] text-lg w-6 text-center ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-neutral-600'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-['Oswald',sans-serif] truncate">{entry.name}</div>
                  <div className="text-neutral-500 text-xs">Lv {entry.level} · {getLevelName(entry.level)}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-white font-['JetBrains_Mono',monospace]">{entry.wins} wins</div>
                  <div className="text-[#F4B400]">🪙 {entry.coins}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Level progress bar */}
      <div className="w-full max-w-2xl">
        <LevelRoadmap currentLevel={player.level} />
      </div>
    </div>
  );
}

function Rule({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span>{icon}</span>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  return (
    <div className={`
      p-3 rounded-xl border transition-all duration-200
      ${unlocked
        ? 'border-[#F4B400]/50 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10'
        : 'border-neutral-700/40 bg-neutral-900/50 opacity-50 grayscale'
      }
    `}>
      <div className="text-2xl mb-1">{achievement.icon}</div>
      <div className="font-['Oswald',sans-serif] text-white text-sm">{achievement.title}</div>
      <div className="text-neutral-400 text-xs mt-0.5">{achievement.desc}</div>
      {unlocked && (
        <div className="text-[#F4B400] text-xs mt-1 font-['JetBrains_Mono',monospace]">✓ Unlocked</div>
      )}
    </div>
  );
}

const LEVEL_MILESTONES = [
  { level: 1, label: 'Beginner' },
  { level: 5, label: 'Amateur' },
  { level: 10, label: 'Skilled' },
  { level: 20, label: 'Pro' },
  { level: 30, label: 'Master' },
  { level: 50, label: 'Legend' },
];

function LevelRoadmap({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-4">
      <div className="font-['Oswald',sans-serif] text-neutral-500 text-xs tracking-wider mb-3">LEVEL JOURNEY</div>
      <div className="flex items-center gap-0">
        {LEVEL_MILESTONES.map((m, i) => {
          const reached = currentLevel >= m.level;
          const isNext = !reached && (i === 0 || currentLevel >= LEVEL_MILESTONES[i - 1].level);
          return (
            <div key={m.level} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-['Oswald',sans-serif]
                  border-2 transition-all duration-300
                  ${reached
                    ? 'bg-[#F4B400] border-yellow-500 text-black'
                    : isNext
                    ? 'bg-neutral-800 border-[#F4B400]/50 text-[#F4B400] animate-pulse'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-600'
                  }
                `}>
                  {m.level}
                </div>
                <div className={`text-center text-[9px] leading-tight truncate w-12 ${
                  reached ? 'text-[#F4B400]' : 'text-neutral-600'
                }`}>
                  {m.label}
                </div>
              </div>
              {i < LEVEL_MILESTONES.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 transition-all duration-500 ${
                  currentLevel >= LEVEL_MILESTONES[i + 1].level
                    ? 'bg-[#F4B400]'
                    : currentLevel >= m.level
                    ? 'bg-gradient-to-r from-[#F4B400] to-neutral-700'
                    : 'bg-neutral-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getBallBg(n: number): string {
  const colors: Record<number, string> = {
    1: '#F0C020', 2: '#1A3EAD', 3: '#C62828', 4: '#6A1FAC',
    5: '#E65100', 6: '#1B7A30', 7: '#8B2500', 8: '#1A1A1A',
    9: '#F0C020', 13: '#E65100',
  };
  return colors[n] || '#888';
}
