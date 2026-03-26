"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip);

// ── tiny confetti (no external dep) ───────────────────────────────────────
function fireConfetti() {
  if (typeof window === "undefined") return;
  const colors = ["#a855f7", "#ec4899", "#22c55e", "#3b82f6", "#f59e0b"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      width:8px; height:8px; border-radius:2px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw; top:-10px;
      animation: confettiFall ${1.2 + Math.random() * 1.5}s ease-in forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
  if (!document.getElementById("confetti-style")) {
    const s = document.createElement("style");
    s.id = "confetti-style";
    s.textContent = `@keyframes confettiFall { to { transform: translateY(105vh) rotate(720deg); opacity:0; } }`;
    document.head.appendChild(s);
  }
}

// ── pre-computed star data (fixes Math.random in render) ──────────────────
const STARS = Array.from({ length: 40 }, () => ({
  width:    Math.random() * 2 + 1,
  height:   Math.random() * 2 + 1,
  top:      Math.random() * 100,
  left:     Math.random() * 100,
  opacity:  Math.random() * 0.7 + 0.2,
  duration: 2 + Math.random() * 3,
  delay:    Math.random() * 3,
}));

// ── shuffle (module-level, fixes hoisting error) ──────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Slider (module-level, fixes component-in-render error) ───────────────
function Slider({ label, emoji, value, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300">{emoji} {label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <input
        type="range" min="0" max="100" value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-green-500"
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LEVEL 0 — Intro
// ══════════════════════════════════════════════════════════════════════════

function Intro({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-4 relative overflow-hidden">
      {/* starfield bg */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e0a3c_0%,_#000_70%)]" />
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:          s.width + "px",
              height:         s.height + "px",
              top:            s.top + "%",
              left:           s.left + "%",
              opacity:        s.opacity,
              animation:      `twinkle ${s.duration}s ease-in-out infinite`,
              animationDelay: s.delay + "s",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      <div className="relative z-10">
        <div style={{ animation: "floatUp 3s ease-in-out infinite" }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
            🕵️ DataVerse
          </h1>
          <p className="text-purple-300 text-sm font-bold uppercase tracking-widest mb-6">
            Build the Smart World
          </p>
        </div>

        <p className="text-gray-300 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Enter the world of <span className="text-green-400 font-semibold">DATA</span>.
          Discover how numbers, text, and patterns control everything —
          from games 🎮 to videos 🎥 and beyond!
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
          {["🧠 Data Types","🔍 Data Hunt","⚔️ Battle Sim","🧱 Pipeline"].map((label) => (
            <span key={label} className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
              {label}
            </span>
          ))}
        </div>

        <button
          onClick={onStart}
          className="px-8 py-3 rounded-full text-base font-bold text-white
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)]
            hover:scale-105 active:scale-95 transition-all duration-200"
        >
          🚀 Start Mission
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LEVEL 1 — Data Types MCQ
// ══════════════════════════════════════════════════════════════════════════

const DATA_TYPES_QUESTIONS = [
  {
    q: "A fitness app tracks your steps daily and shows a graph. What type of data is mainly used?",
    options: ["Qualitative only", "Quantitative (continuous)", "Random data", "No data"],
    correct: 1,
    clue: "Think numbers changing over time",
    exp: "Steps are numerical and continuous over time — that's quantitative continuous data.",
  },
  {
    q: "A user writes: 'This movie is amazing!' What type of data is this?",
    options: ["Quantitative", "Discrete", "Qualitative", "Continuous"],
    correct: 2,
    clue: "Words, not numbers",
    exp: "Opinions and descriptions are qualitative data — they can't be measured numerically.",
  },
];

function DataTypesLevel({ onNext, onLoseLife }) {
  const [idx,      setIdx]      = useState(0);
  const [selected, setSelected] = useState(null);
  const [done,     setDone]     = useState(false);

  const cur = DATA_TYPES_QUESTIONS[idx];

  const handleClick = (i) => {
    if (done) return;
    setSelected(i);
    setDone(true);
    if (i !== cur.correct) onLoseLife();
  };

  const handleNext = () => {
    if (idx === DATA_TYPES_QUESTIONS.length - 1) {
      onNext(20);
    } else {
      setIdx((n) => n + 1);
      setSelected(null);
      setDone(false);
    }
  };

  return (
    <LevelShell title="🧠 Data Decoder" subtitle="Identify the correct data type" color="purple">
      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>Question {idx + 1} / {DATA_TYPES_QUESTIONS.length}</span>
      </div>

      <p className="text-white font-semibold mb-2 leading-relaxed">{cur.q}</p>
      <p className="text-yellow-400 text-xs mb-4">🔍 Clue: {cur.clue}</p>

      <div className="space-y-2 mb-4">
        {cur.options.map((opt, i) => {
          let cls = "border-gray-600 hover:border-purple-400 text-gray-200";
          if (done) {
            if (i === cur.correct) cls = "border-green-400 bg-green-500/10 text-green-300";
            else if (i === selected) cls = "border-red-400 bg-red-500/10 text-red-300";
            else cls = "border-gray-700 text-gray-500";
          }
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${cls} ${!done ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className="font-bold mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="space-y-3">
          <div className={`px-4 py-3 rounded-xl text-sm ${selected === cur.correct ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
            {selected === cur.correct ? "✅" : "❌"} {cur.exp}
          </div>
          <button onClick={handleNext} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors">
            {idx === DATA_TYPES_QUESTIONS.length - 1 ? "Complete Level →" : "Next Question →"}
          </button>
        </div>
      )}
    </LevelShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LEVEL 2 — Data Hunt MCQ
// ══════════════════════════════════════════════════════════════════════════

const DATA_HUNT_QUESTIONS = [
  {
    q: "A hospital records patient names, ages, and blood types. Which is qualitative?",
    options: ["Age", "Blood type", "Heart rate", "Weight"],
    correct: 1,
    clue: "Can it be put into a category rather than measured?",
    exp: "Blood type (A, B, AB, O) is a category — qualitative data.",
  },
  {
    q: "Which data type would you use to count how many goals a team scored?",
    options: ["Qualitative", "Continuous", "Discrete", "Textual"],
    correct: 2,
    clue: "Goals are whole numbers — you can't score 2.7 goals",
    exp: "Goals are countable whole numbers — that's discrete quantitative data.",
  },
];

function DataHuntLevel({ onNext, onLoseLife }) {
  const [idx,      setIdx]      = useState(0);
  const [selected, setSelected] = useState(null);
  const [done,     setDone]     = useState(false);

  const cur = DATA_HUNT_QUESTIONS[idx];

  const handleClick = (i) => {
    if (done) return;
    setSelected(i);
    setDone(true);
    if (i !== cur.correct) onLoseLife();
  };

  const handleNext = () => {
    if (idx === DATA_HUNT_QUESTIONS.length - 1) {
      onNext(20);
    } else {
      setIdx((n) => n + 1);
      setSelected(null);
      setDone(false);
    }
  };

  return (
    <LevelShell title="🔍 Data Hunt" subtitle="Track down the right data type" color="blue">
      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>Question {idx + 1} / {DATA_HUNT_QUESTIONS.length}</span>
      </div>

      <p className="text-white font-semibold mb-2 leading-relaxed">{cur.q}</p>
      <p className="text-yellow-400 text-xs mb-4">🔍 Clue: {cur.clue}</p>

      <div className="space-y-2 mb-4">
        {cur.options.map((opt, i) => {
          let cls = "border-gray-600 hover:border-blue-400 text-gray-200";
          if (done) {
            if (i === cur.correct) cls = "border-green-400 bg-green-500/10 text-green-300";
            else if (i === selected) cls = "border-red-400 bg-red-500/10 text-red-300";
            else cls = "border-gray-700 text-gray-500";
          }
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${cls} ${!done ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className="font-bold mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="space-y-3">
          <div className={`px-4 py-3 rounded-xl text-sm ${selected === cur.correct ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
            {selected === cur.correct ? "✅" : "❌"} {cur.exp}
          </div>
          <button onClick={handleNext} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
            {idx === DATA_HUNT_QUESTIONS.length - 1 ? "Complete Level →" : "Next Question →"}
          </button>
        </div>
      )}
    </LevelShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LEVEL 3 — Battle Simulator
// ══════════════════════════════════════════════════════════════════════════

function BattleLevel({ onNext }) {
  const [speed,  setSpeed]  = useState(50);
  const [power,  setPower]  = useState(50);
  const [health, setHealth] = useState(50);
  const [enemy,  setEnemy]  = useState(null);
  const [result, setResult] = useState("");
  const [built,  setBuilt]  = useState(false);

  const handleBattle = () => {
    const playerScore = speed * 0.4 + power * 0.4 + health * 0.2;
    const e = {
      speed:  Math.floor(Math.random() * 100),
      power:  Math.floor(Math.random() * 100),
      health: Math.floor(Math.random() * 100),
    };
    const enemyScore = e.speed * 0.4 + e.power * 0.4 + e.health * 0.2;
    setEnemy(e);
    setBuilt(true);
    if      (playerScore > enemyScore)  setResult("🏆 YOU WIN! Your data is stronger.");
    else if (playerScore === enemyScore) setResult("⚖️ DRAW! Equal strength.");
    else                                setResult("💀 YOU LOSE! Try adjusting your stats.");
  };

  return (
    <LevelShell title="⚔️ Battle Simulator" subtitle="Use data to build the strongest player" color="green">
      <p className="text-gray-400 text-xs mb-4">
        Adjust your stats. The formula: Score = Speed×0.4 + Power×0.4 + Health×0.2
      </p>

      <div className="space-y-3 mb-4">
        <Slider label="Speed"  emoji="⚡" value={speed}  onChange={setSpeed} />
        <Slider label="Power"  emoji="💪" value={power}  onChange={setPower} />
        <Slider label="Health" emoji="❤️" value={health} onChange={setHealth} />
      </div>

      <button
        onClick={handleBattle}
        className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm mb-4 transition-colors shadow-[0_0_10px_#22c55e60]"
      >
        ⚔️ Start Battle
      </button>

      {built && enemy && (
        <div className="space-y-4">
          <div className="h-48">
            <Line
              data={{
                labels: ["Speed", "Power", "Health"],
                datasets: [
                  { label: "You",   data: [speed, power, health],                          borderColor: "#22c55e", tension: 0.3 },
                  { label: "Enemy", data: [enemy.speed, enemy.power, enemy.health],         borderColor: "#ef4444", tension: 0.3 },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#9ca3af", font: { size: 11 } } } },
                scales: {
                  y: { min: 0, max: 100, ticks: { color: "#6b7280" }, grid: { color: "#374151" } },
                  x: { ticks: { color: "#6b7280" }, grid: { color: "#374151" } },
                },
              }}
            />
          </div>

          <div className={`px-4 py-3 rounded-xl text-sm font-bold text-center ${result.includes("WIN") ? "bg-green-500/10 border border-green-500/30 text-green-300" : result.includes("DRAW") ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
            {result}
          </div>

          <p className="text-gray-500 text-xs text-center">
            👉 Data was analyzed to predict the winner.
          </p>

          <button
            onClick={() => onNext(25)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
          >
            Next Level →
          </button>
        </div>
      )}
    </LevelShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LEVEL 4 — Pipeline
// ══════════════════════════════════════════════════════════════════════════

const CORRECT_ORDER = ["Collect Data", "Clean Data", "Analyze Data", "Visualize Result"];

function PipelineLevel({ onNext, onLoseLife }) {
  const [steps,    setSteps]    = useState(() => shuffle([...CORRECT_ORDER]));
  const [checked,  setChecked]  = useState(false);
  const [msg,      setMsg]      = useState("");
  const [showClue, setShowClue] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (i) => setDragging(i);
  const handleDragOver  = (e, i) => { e.preventDefault(); setDragOver(i); };

  const handleDrop = (i) => {
    if (dragging === null || dragging === i) return;
    const next = [...steps];
    [next[dragging], next[i]] = [next[i], next[dragging]];
    setSteps(next);
    setDragging(null);
    setDragOver(null);
  };

  const handleCheck = () => {
    const correct = steps.every((s, i) => s === CORRECT_ORDER[i]);
    setChecked(true);
    if (correct) {
      setMsg("🎉 Perfect! You built a real data pipeline!");
      fireConfetti();
      setTimeout(() => onNext(30), 1500);
    } else {
      setMsg("❌ Not quite! Remember: you must CLEAN data before you ANALYZE it.");
      onLoseLife();
    }
  };

  const handleReset = () => {
    setSteps(shuffle([...CORRECT_ORDER]));
    setChecked(false);
    setMsg("");
  };

  return (
    <LevelShell title="🧱 Pipeline Builder" subtitle="Drag the steps into the correct order" color="orange">
      <p className="text-gray-400 text-xs mb-4 text-center">
        A video platform wants to recommend videos. Arrange the data pipeline steps correctly.
      </p>

      <div className="flex justify-center mb-3">
        <button
          onClick={() => setShowClue((v) => !v)}
          className="px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold hover:bg-yellow-500/30 transition-colors"
        >
          {showClue ? "Hide Clue" : "💡 Show Clue"}
        </button>
      </div>

      {showClue && (
        <p className="text-yellow-400 text-xs text-center mb-3">
          👉 You cannot analyze messy data. Always clean first!
        </p>
      )}

      <div className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <div
            key={step}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-grab select-none transition-all
              ${dragOver === i ? "border-orange-400 bg-orange-500/10" : checked && steps[i] === CORRECT_ORDER[i] ? "border-green-500 bg-green-500/10" : checked ? "border-red-400 bg-red-500/10" : "border-gray-600 bg-gray-800/50 hover:border-orange-400/50"}`}
          >
            <span className="text-gray-400 font-mono text-xs w-4">{i + 1}.</span>
            <span className="text-sm font-medium text-white flex-1">{step}</span>
            <span className="text-gray-500 text-xs">⠿</span>
          </div>
        ))}
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm mb-3 ${msg.includes("Perfect") ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleCheck}
          disabled={checked && msg.includes("Perfect")}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-colors disabled:opacity-40"
        >
          Check Order ✓
        </button>
      </div>
    </LevelShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LEVEL 5 — Final Boss / Results
// ══════════════════════════════════════════════════════════════════════════

function FinalBoss({ score, maxScore, onRestart }) {
  const pct  = Math.round((score / maxScore) * 100);
  const rank = pct >= 90 ? "🏆 Data Master" : pct >= 70 ? "🥈 Data Analyst" : pct >= 50 ? "🥉 Data Cadet" : "📚 Keep Practising";

  return (
    <LevelShell title="🏁 Mission Complete!" subtitle="DataVerse challenge finished" color="pink">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {score}
        </div>
        <p className="text-gray-400 text-sm">out of {maxScore} points</p>

        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-sm">
          {rank}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full text-xs text-center mt-2">
          {[
            { label: "Data Types", points: "20 XP" },
            { label: "Data Hunt",  points: "20 XP" },
            { label: "Battle Sim", points: "25 XP" },
            { label: "Pipeline",   points: "30 XP" },
          ].map((item) => (
            <div key={item.label} className="px-3 py-2 rounded-xl bg-gray-800/60 border border-gray-700">
              <p className="text-gray-400">{item.label}</p>
              <p className="text-green-400 font-bold">{item.points}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          🔄 Play Again
        </button>
      </div>
    </LevelShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Shared shell
// ══════════════════════════════════════════════════════════════════════════

const COLOR_MAP = {
  purple: { border: "border-purple-500/30", title: "text-purple-400", bg: "bg-purple-500/5" },
  blue:   { border: "border-blue-500/30",   title: "text-blue-400",   bg: "bg-blue-500/5"  },
  green:  { border: "border-green-500/30",  title: "text-green-400",  bg: "bg-green-500/5" },
  orange: { border: "border-orange-500/30", title: "text-orange-400", bg: "bg-orange-500/5"},
  pink:   { border: "border-pink-500/30",   title: "text-pink-400",   bg: "bg-pink-500/5"  },
};

function LevelShell({ title, subtitle, color, children }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.purple;
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <h3 className={`text-lg font-bold ${c.title} mb-0.5`}>{title}</h3>
      <p className="text-gray-500 text-xs mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// HUD
// ══════════════════════════════════════════════════════════════════════════

function HUD({ level, lives, score, totalLevels }) {
  const LEVEL_NAMES = ["Intro", "Data Types", "Data Hunt", "Battle Sim", "Pipeline", "Results"];
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-1">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`text-lg ${i < lives ? "opacity-100" : "opacity-20"}`}>❤️</span>
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div className="flex gap-1 mb-1">
          {[...Array(totalLevels)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < level - 1 ? "bg-green-500" : i === level - 1 ? "bg-purple-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          {LEVEL_NAMES[level] ?? ""}
        </span>
      </div>
      <div className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
        <span className="text-yellow-400 text-sm">⭐</span>
        <span className="text-white text-sm font-bold">{score}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════

export default function DataVerseGame({ xp = 95 }) {
  const MAX_SCORE    = 95;
  const TOTAL_LEVELS = 4;

  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  const next = (points = 0) => {
    setScore((s) => s + points);
    setLevel((l) => l + 1);
  };

  const loseLife = () => {
    setLives((l) => {
      if (l <= 1) {
        setTimeout(() => { setLevel(0); setScore(0); setLives(3); }, 800);
        return 0;
      }
      return l - 1;
    });
  };

  const restart = () => { setLevel(0); setScore(0); setLives(3); };

  return (
    <div className="rounded-2xl overflow-hidden bg-[#080c14] border border-purple-500/20 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-500/20 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <span className="text-purple-400 text-xs">🕹</span>
          </div>
          <span className="text-sm font-bold text-purple-300">DataVerse Challenge</span>
        </div>
        <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
          +{xp} XP
        </span>
      </div>

      <div className="p-4">
        {level >= 1 && level <= TOTAL_LEVELS && (
          <HUD level={level} lives={lives} score={score} totalLevels={TOTAL_LEVELS} />
        )}

        {level === 0 && <Intro          onStart={() => setLevel(1)} />}
        {level === 1 && <DataTypesLevel onNext={next} onLoseLife={loseLife} />}
        {level === 2 && <DataHuntLevel  onNext={next} onLoseLife={loseLife} />}
        {level === 3 && <BattleLevel    onNext={next} />}
        {level === 4 && <PipelineLevel  onNext={next} onLoseLife={loseLife} />}
        {level === 5 && <FinalBoss      score={score} maxScore={MAX_SCORE} onRestart={restart} />}
      </div>
    </div>
  );
}