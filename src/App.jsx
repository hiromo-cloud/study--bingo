import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Play, Square, Check, Timer, X, Star, Sparkles, Trophy, Palette } from 'lucide-react';

// テーマカラーの定義
const THEMES = {
  rose: { name: "さくら", primary: "bg-rose-500", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", hover: "hover:bg-rose-600", ring: "ring-rose-200", line: "#F43F5E" },
  sky: { name: "そら", primary: "bg-sky-500", light: "bg-sky-50", border: "border-sky-200", text: "text-sky-600", hover: "hover:bg-sky-600", ring: "ring-sky-200", line: "#0EA5E9" },
  emerald: { name: "わかば", primary: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", hover: "hover:bg-emerald-600", ring: "ring-emerald-200", line: "#10B981" },
  amber: { name: "ひまわり", primary: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", hover: "hover:bg-amber-600", ring: "ring-amber-200", line: "#F59E0B" },
  violet: { name: "すみれ", primary: "bg-violet-500", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-600", hover: "hover:bg-violet-600", ring: "ring-violet-200", line: "#8B5CF6" },
};

const DEFAULT_ITEMS = [
  { text: "そろばん", icon: "🧮" },
  { text: "キーボード", icon: "⌨️" },
  { text: "かんじ", icon: "📱" },
  { text: "こくご", icon: "📝" },
  { text: "さんすう", icon: "📐" },
  { text: "よしゅう", icon: "📚" },
  { text: "どくしょ", icon: "📖" },
  { text: "おてつだい", icon: "🧹" }
];

const DEFAULT_TIME = 30;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function App() {
  const [items, setItems] = useState([]);
  const [grid, setGrid] = useState([]); 
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempItems, setTempItems] = useState([...DEFAULT_ITEMS]);
  const [tempTime, setTempTime] = useState(DEFAULT_TIME);
  const [winningLines, setWinningLines] = useState([]);
  const [themeKey, setThemeKey] = useState('rose');

  const theme = THEMES[themeKey] || THEMES.rose;

  const generateGrid = (itemList) => {
    const shuffledItems = [...itemList].sort(() => Math.random() - 0.5);
    const newGrid = [];
    let itemIdx = 0;
    
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        newGrid.push({ id: 'free', text: 'FREE', icon: '🎁', completed: true, isFree: true });
      } else {
        newGrid.push({ ...shuffledItems[itemIdx], id: i, completed: false, isFree: false });
        itemIdx++;
      }
    }
    return newGrid;
  };

  useEffect(() => {
    const savedItems = localStorage.getItem('bingo_items_v4');
    const savedTime = localStorage.getItem('bingo_time_v4');
    const savedTheme = localStorage.getItem('bingo_theme_v4');
    
    const initialItems = savedItems ? JSON.parse(savedItems) : DEFAULT_ITEMS;
    const initialTime = savedTime ? parseInt(savedTime) : DEFAULT_TIME;
    const initialTheme = savedTheme && THEMES[savedTheme] ? savedTheme : 'rose';

    setItems(initialItems);
    setTempItems(initialItems);
    setTimeLimit(initialTime);
    setTempTime(initialTime);
    setTimeLeft(initialTime * 60);
    setThemeKey(initialTheme);

    setGrid(generateGrid(initialItems));
  }, []);

  useEffect(() => {
    const currentWinningLines = WINNING_COMBINATIONS.filter(combo => 
      combo.every(index => grid[index]?.completed)
    );
    setWinningLines(currentWinningLines);
  }, [grid]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      clearInterval(interval);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleItem = (index) => {
    if (grid[index].isFree) return;
    const newGrid = [...grid];
    newGrid[index].completed = !newGrid[index].completed;
    setGrid(newGrid);
  };

  const shuffleGrid = () => {
    setGrid(generateGrid(items));
    setWinningLines([]);
  };

  const saveSettings = () => {
    setItems(tempItems);
    setTimeLimit(tempTime);
    setTimeLeft(tempTime * 60);
    setTimerActive(false);
    
    localStorage.setItem('bingo_items_v4', JSON.stringify(tempItems));
    localStorage.setItem('bingo_time_v4', tempTime.toString());
    localStorage.setItem('bingo_theme_v4', themeKey);

    setGrid(generateGrid(tempItems));
    setShowSettings(false);
  };

  const handleItemChange = (index, field, value) => {
    const newTemp = [...tempItems];
    newTemp[index] = { ...newTemp[index], [field]: value };
    setTempItems(newTemp);
  };

  const getLineStyles = (combo) => {
    const positions = [
      { x: '16.6%', y: '16.6%' }, { x: '50%', y: '16.6%' }, { x: '83.3%', y: '16.6%' },
      { x: '16.6%', y: '50%' },   { x: '50%', y: '50%' },   { x: '83.3%', y: '50%' },
      { x: '16.6%', y: '83.3%' }, { x: '50%', y: '83.3%' }, { x: '83.3%', y: '83.3%' }
    ];
    return {
      x1: positions[combo[0]].x,
      y1: positions[combo[0]].y,
      x2: positions[combo[2]].x,
      y2: positions[combo[2]].y
    };
  };

  return (
    <div className={`min-h-screen ${theme.light} p-4 font-sans text-slate-800 flex flex-col items-center relative overflow-hidden transition-colors duration-500`}>
      {winningLines.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(24)].map((_, i) => (
            <Sparkles 
              key={i}
              className="absolute text-yellow-400 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${12 + Math.random() * 24}px`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.7
              }}
            />
          ))}
        </div>
      )}

      <div className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-4 ${theme.border} z-10 transition-all duration-500`}>
        <div className={`${theme.primary} p-6 text-white text-center relative transition-colors duration-500`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl animate-bounce">✨</span>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase">STUDY BINGO</h1>
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center justify-between bg-black/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Timer className="w-6 h-6" />
                  <span className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTimerActive(!timerActive)}
                    className={`p-2 rounded-full transition-all ${timerActive ? 'bg-black/20 shadow-inner' : 'bg-green-500 shadow-md hover:scale-110'}`}
                  >
                    {timerActive ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>
                  <button 
                    onClick={() => { setTimeLeft(timeLimit * 60); setTimerActive(false); }}
                    className="p-2 bg-slate-600 rounded-full shadow-md hover:scale-110 transition-all"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className={`flex flex-col items-center justify-center bg-yellow-400 ${theme.text} rounded-2xl p-2 px-4 shadow-lg min-w-[80px] transition-transform duration-500 ${winningLines.length > 0 ? 'scale-110 animate-pulse' : ''}`}>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-black">BINGO</span>
                </div>
                <span className="text-3xl font-black leading-none">{winningLines.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white relative">
          {winningLines.length > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <div className={`bg-yellow-400 ${theme.text} px-10 py-5 rounded-full font-black text-5xl shadow-2xl border-4 border-white rotate-[-8deg] animate-bounce whitespace-nowrap`}>
                BINGO!
              </div>
            </div>
          )}

          <div className="relative grid grid-cols-3 gap-3 mb-6">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
              {winningLines.map((combo, idx) => {
                const styles = getLineStyles(combo);
                return (
                  <line
                    key={idx}
                    x1={styles.x1} y1={styles.y1} x2={styles.x2} y2={styles.y2}
                    stroke={theme.line} strokeWidth="12" strokeLinecap="round"
                    style={{ 
                      strokeDasharray: '1000', strokeDashoffset: '1000', 
                      animation: 'draw 0.6s forwards ease-out',
                      filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))'
                    }}
                  />
                );
              })}
            </svg>

            {grid.map((cell, index) => (
              <button
                key={index}
                onClick={() => toggleItem(index)}
                disabled={cell.isFree}
                className={`
                  aspect-square rounded-2xl p-2 flex flex-col items-center justify-center text-center
                  transition-all duration-300 transform relative overflow-hidden
                  ${cell.isFree
                    ? 'bg-yellow-50 border-4 border-yellow-400 text-yellow-700 cursor-default'
                    : cell.completed 
                      ? `${theme.primary} text-white shadow-inner scale-95` 
                      : `bg-white border-2 ${theme.border.replace('border-', 'border-opacity-30 border-')} text-slate-700 shadow-xl hover:${theme.border} active:scale-95`
                  }
                `}
              >
                <span className={`text-4xl sm:text-5xl mb-2 transition-transform ${cell.completed && !cell.isFree ? 'scale-110 opacity-40' : 'scale-100'}`}>
                  {cell.icon}
                </span>
                <span className={`text-xs sm:text-sm font-black uppercase tracking-tight leading-tight break-all px-1 ${cell.completed && !cell.isFree ? 'opacity-40' : ''}`}>
                  {cell.text}
                </span>
                {cell.completed && !cell.isFree && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10">
                    <Check className="w-16 h-16 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] animate-in zoom-in duration-300" strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={shuffleGrid}
              className={`flex-1 py-5 ${theme.primary} ${theme.hover} text-white rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95`}
            >
              <RefreshCw className="w-6 h-6" />
              シャッフル
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold shadow-md transition-all active:scale-95"
            >
              <Settings className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                <Settings className="w-5 h-5" /> せってい
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Palette className="w-4 h-4" /> おきにいりの色
                </label>
                <div className="flex justify-between gap-2">
                  {Object.entries(THEMES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setThemeKey(key)}
                      className={`
                        w-12 h-12 rounded-full border-4 transition-all transform
                        ${t.primary} ${themeKey === key ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent scale-100 opacity-60'}
                      `}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">
                  ⏱ せいげんじかん (ぷん)
                </label>
                <input
                  type="number"
                  value={tempTime}
                  onChange={(e) => setTempTime(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full p-3 bg-slate-100 rounded-xl text-xl font-black focus:ring-4 ${theme.ring} outline-none`}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">
                  📝 べんきょうのこうもく
                </label>
                <div className="space-y-2">
                  {tempItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border-2 border-slate-100">
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => handleItemChange(idx, 'icon', e.target.value)}
                        className={`w-12 p-2 bg-white border-2 border-slate-200 rounded-lg text-center text-lg focus:${theme.border} outline-none shrink-0`}
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleItemChange(idx, 'text', e.target.value)}
                        className={`flex-1 p-2 bg-white border-2 border-slate-200 rounded-lg focus:${theme.border} outline-none text-sm font-bold`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                onClick={saveSettings}
                className={`w-full py-4 ${theme.primary} ${theme.hover} text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95`}
              >
                ほぞんして もどる
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-slate-400 text-xs font-black uppercase tracking-widest">
        BINGO Aim for full complete!
      </p>
    </div>
  );
}
