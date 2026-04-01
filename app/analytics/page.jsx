export default function Analytics() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Background blobs */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Nav */}
      <nav className="border-b border-orange-500/20 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Gamified Logo" className="w-9 h-9 drop-shadow-sm" />
              <span className="font-display font-bold text-xl tracking-tight text-white">Gamified</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a className="text-white/50 hover:text-primary transition-colors text-sm font-medium" href="/dashboard">Dashboard</a>
              <a className="text-primary font-semibold border-b-2 border-primary text-sm" href="#">Analytics</a>
              <a className="text-white/50 hover:text-primary transition-colors text-sm font-medium" href="/leaderboard">Leaderboard</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <span className="material-icons-round text-primary text-sm">local_fire_department</span>
                <span className="font-bold text-primary text-sm">Streak Active</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        <header className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2 text-white">Command Center</h1>
          <p className="text-white/50">Track your trajectory across the cosmos of knowledge.</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total XP", value: "14,250", icon: "stars", sub: "+1,240 this week", subColor: "text-primary" },
            { label: "Rank", value: "Solar Cadet", icon: "workspace_premium", sub: "840 XP to Nova Commander", subColor: "text-white/40" },
            { label: "Time Spent", value: "42h 15m", icon: "schedule", sub: "Daily average: 1.4h", subColor: "text-white/40" },
            { label: "Correctness", value: "88.4%", icon: "fact_check", sub: "Top 5% in your grade", subColor: "text-white/40" },
          ].map(({ label, value, icon, sub, subColor }) => (
            <div key={label} className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50 text-sm font-medium">{label}</span>
                <span className="material-icons-round text-primary">{icon}</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">{value}</div>
              <div className={`mt-2 text-xs flex items-center gap-1 ${subColor}`}>
                {subColor === "text-primary" && <span className="material-icons-round text-xs">trending_up</span>}
                {sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            {/* Knowledge Trajectory Chart */}
            <div className="bg-[#141414] border border-orange-500/20 p-8 rounded-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Knowledge Trajectory</h2>
                  <p className="text-sm text-white/40">XP earned over the last 14 days</p>
                </div>
                <select className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg text-sm text-white/70 px-3 py-1.5 focus:outline-none focus:border-primary">
                  <option>Last 14 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 relative">
                {[25,40,20,60,50,90,33,40,75,80,50,70,25,95].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-lg transition-all cursor-pointer group relative ${i === 13 ? 'bg-primary hover:shadow-[0_-5px_15px_rgba(255,107,0,0.5)]' : 'bg-primary/30 hover:bg-primary/50'}`} style={{ height: `${h}%` }}>
                    {i === 13 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold bg-primary text-white px-2 py-1 rounded whitespace-nowrap">Today</div>}
                  </div>
                ))}
                <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  <span>2 Weeks Ago</span>
                  <span>Yesterday</span>
                  <span className="text-primary">Today</span>
                </div>
              </div>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
                <h3 className="font-display font-bold mb-6 flex items-center gap-2 text-white">
                  <span className="material-icons-round text-green-400">trending_up</span> Strengths
                </h3>
                <div className="space-y-6">
                  {[["Quantum Physics", 96], ["Astrophysics Basics", 88], ["Exoplanet Discovery", 82]].map(([name, pct]) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-white/80">{name}</span>
                        <span className="text-green-400 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
                <h3 className="font-display font-bold mb-6 flex items-center gap-2 text-white">
                  <span className="material-icons-round text-red-400">warning</span> Challenges
                </h3>
                <div className="space-y-6">
                  {[["Orbital Mechanics", 42], ["Rocket Fuel Chemistry", 55]].map(([name, pct]) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-white/80">{name}</span>
                        <span className="text-white/40">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-all border border-primary/20">
                    Launch Review Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">

            {/* Learning Consistency */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
              <h3 className="font-display font-bold mb-4 flex items-center justify-between text-white">
                Learning Consistency
                <span className="text-xs font-normal text-white/40 uppercase tracking-widest">This Month</span>
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {["M","T","W","T","F","S","S"].map((d,i) => (
                  <div key={i} className="text-[10px] text-center text-white/30 font-bold">{d}</div>
                ))}
                {[null,null,null,20,40,null,100,80,60,100,100,100,100,null,null,null,null,null,null,null].map((v,i) => (
                  <div key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                      v === 100 ? "bg-primary text-white shadow-[0_0_8px_rgba(255,107,0,0.4)]" :
                      v === 80  ? "bg-primary/80 text-white" :
                      v === 60  ? "bg-primary/60 text-white" :
                      v === 40  ? "bg-primary/40 text-primary" :
                      v === 20  ? "bg-primary/20 border border-primary/30 text-primary" :
                      "bg-[#1a1a1a] border border-white/5"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4 border-t border-orange-500/10 pt-4">
                {[["12","Current"],["24","Best"],["92%","Month"]].map(([val, sub], i) => (
                  <div key={i} className="text-center flex-1">
                    <div className={`text-sm font-bold ${i === 1 ? "text-primary" : "text-white"}`}>{val}</div>
                    <div className="text-[10px] text-white/30 uppercase">{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Attempts */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
              <h3 className="font-display font-bold mb-4 text-white">Mission Attempts</h3>
              <div className="space-y-4">
                {[
                  { icon: "rocket", name: "Mars Exploration", attempts: 24, pct: 82, color: "bg-orange-500/10 text-orange-400" },
                  { icon: "public", name: "Terraforming 101", attempts: 18, pct: 75, color: "bg-blue-500/10 text-blue-400" },
                  { icon: "category", name: "Void Mechanics", attempts: 12, pct: 45, color: "bg-purple-500/10 text-purple-400" },
                ].map(({ icon, name, attempts, pct, color }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 ${color.split(' ')[0]}`}>
                      <span className={`material-icons-round ${color.split(' ')[1]}`}>{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{name}</div>
                      <div className="text-xs text-white/40">{attempts} Total Attempts</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${pct >= 75 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 text-xs text-white/30 hover:text-primary transition-colors flex items-center justify-center gap-1 font-bold">
                VIEW FULL MISSION LOG <span className="material-icons-round text-xs">arrow_forward</span>
              </button>
            </div>

            {/* Achievements */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">Achievements</h3>
                <span className="text-xs text-primary font-bold">12 / 48</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {[
                  { grad: "from-orange-600 to-yellow-400", icon: "auto_awesome", color: "text-primary", label: "Streak King" },
                  { grad: null, icon: "speed", color: "text-white/20", label: "Supersonic", locked: true },
                  { grad: "from-purple-600 to-blue-400", icon: "psychology", color: "text-purple-400", label: "Mind Reader", shadow: "shadow-purple-500/20" },
                  { grad: "from-green-600 to-emerald-400", icon: "verified", color: "text-green-400", label: "Master", shadow: "shadow-green-500/20" },
                ].map(({ grad, icon, color, label, locked, shadow }) => (
                  <div key={label} className={`min-w-[70px] flex flex-col items-center gap-2 ${locked ? 'opacity-40 grayscale' : ''}`}>
                    <div className={`w-14 h-14 rounded-full p-0.5 ${grad ? `bg-gradient-to-tr ${grad} shadow-lg ${shadow || 'shadow-primary/20'}` : 'bg-[#222]'}`}>
                      <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center border-2 border-white/10">
                        <span className={`material-icons-round text-2xl ${color}`}>{icon}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-center font-bold uppercase text-white/40">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse border border-primary/20">
              <span className="material-icons-round text-primary">tips_and_updates</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Pro Tip: Fuel your engine!</h4>
              <p className="text-xs text-white/40">You tend to perform 15% better on Tuesday mornings.</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-orange-500/20 font-bold text-sm hover:bg-white/5 hover:border-primary/40 text-white/60 hover:text-white transition-all">
              Download Full Report
            </button>
            <a href="/dashboard" className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-primary/25 text-center">
              Return to Dashboard
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}