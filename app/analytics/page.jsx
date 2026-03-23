export default function Analytics() {
  return (
<>
    <nav className="border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-icons-round text-white text-xl">rocket_launch</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">ASTRO<span className="text-primary">LEARN</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Dashboard</a>
                    <a className="text-primary font-semibold border-b-2 border-primary" href="#">Analytics</a>
                    <a className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Quests</a>
                    <a className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Leaderboard</a>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <span className="material-icons-round text-primary text-sm">local_fire_department</span>
                        <span className="font-bold text-primary">12 Day Streak</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-primary overflow-hidden">
                        <img alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDptR9RBuZbhPUFE0vDKUUQxqIPVt91T0hqJcx4riEjMm9Izxwkbz7zSWXwUbTeDgo0jViDSlYjLxba5Us4Eg9ELqziTmh76klIHeZMvJeDAvobh08dOFjmMRYvL9RZEdKnSWOBA5rL9NCTr1sndjLqhMXXujeEUkMrZMhuaMm2Cu3luGsozToltjJxqGSsK5sfXLYel9gJTfRKc2n2obx79WPs_-QrctNGNX6LmwZpRnC-T0M45u0l5mWaffksRXjEsIdr7UzHxA" />
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <header className="mb-10">
            <h1 className="font-display text-4xl font-bold mb-2">Command Center</h1>
            <p className="text-slate-500 dark:text-slate-400">Track your trajectory across the cosmos of knowledge.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl glow-orange">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">Total XP</span>
                    <span className="material-icons-round text-primary">stars</span>
                </div>
                <div className="text-3xl font-display font-bold">14,250</div>
                <div className="mt-2 text-xs text-green-500 flex items-center">
                    <span className="material-icons-round text-xs">trending_up</span> +1,240 this week
                </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">Rank</span>
                    <span className="material-icons-round text-primary">workspace_premium</span>
                </div>
                <div className="text-3xl font-display font-bold">Solar Cadet</div>
                <div className="mt-2 text-xs text-slate-400">840 XP to Nova Commander</div>
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">Time Spent</span>
                    <span className="material-icons-round text-primary">schedule</span>
                </div>
                <div className="text-3xl font-display font-bold">42h 15m</div>
                <div className="mt-2 text-xs text-slate-400">Daily average: 1.4h</div>
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">Correctness</span>
                    <span className="material-icons-round text-primary">fact_check</span>
                </div>
                <div className="text-3xl font-display font-bold">88.4%</div>
                <div className="mt-2 text-xs text-slate-400">Top 5% in your grade</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-8">

                <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-8 rounded-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-display text-xl font-bold">Knowledge Trajectory</h2>
                            <p className="text-sm text-slate-500">XP earned over the last 14 days</p>
                        </div>
                        <select className="bg-slate-100 dark:bg-white/5 border-none rounded-lg text-sm focus:ring-primary">
                            <option>Last 14 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 relative">
                        <div className="flex-1 bg-primary/20 rounded-t-lg h-1/4 hover:bg-primary/40 transition-all cursor-pointer group relative">
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">120 XP</span>
                        </div>
                        <div className="flex-1 bg-primary/30 rounded-t-lg h-2/5 hover:bg-primary/40 transition-all cursor-pointer group relative">
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">250 XP</span>
                        </div>
                        <div className="flex-1 bg-primary/20 rounded-t-lg h-1/5 hover:bg-primary/40 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/60 rounded-t-lg h-3/5 hover:bg-primary/80 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/40 rounded-t-lg h-2/4 hover:bg-primary/40 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/80 rounded-t-lg h-[90%] hover:bg-primary/90 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/20 rounded-t-lg h-1/3 hover:bg-primary/40 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/30 rounded-t-lg h-2/5 hover:bg-primary/40 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/60 rounded-t-lg h-3/4 hover:bg-primary/80 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/90 rounded-t-lg h-[80%] hover:bg-primary/100 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/40 rounded-t-lg h-1/2 hover:bg-primary/40 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/70 rounded-t-lg h-4/5 hover:bg-primary/80 transition-all cursor-pointer group relative"></div>
                        <div className="flex-1 bg-primary/30 rounded-t-lg h-1/4 hover:bg-primary/40 transition-all cursor-pointer group relative"></div>
                        
                        <div className="flex-1 bg-primary rounded-t-lg h-[95%] hover:shadow-[0_-5px_15px_rgba(255,107,0,0.5)] transition-all cursor-pointer group relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold bg-primary text-white px-2 py-1 rounded">Today</div>
                        </div>

                        <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            <span>2 Weeks Ago</span>
                            <span>Yesterday</span>
                            <span className="text-primary">Today</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
                            <span className="material-icons-round text-green-500">trending_up</span> Stellar Strengths
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">Quantum Physics</span>
                                    <span className="text-slate-400">96%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[96%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">Astrophysics Basics</span>
                                    <span className="text-slate-400">88%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[88%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">Exoplanet Discovery</span>
                                    <span className="text-slate-400">82%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[82%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
                            <span className="material-icons-round text-red-400">warning</span> Nebula Challenges
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">Orbital Mechanics</span>
                                    <span className="text-slate-400">42%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/40 w-[42%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">Rocket Fuel Chemistry</span>
                                    <span className="text-slate-400">55%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/40 w-[55%]"></div>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-all border border-primary/20">
                                Launch Review Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">

                <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                    <h3 className="font-display font-bold mb-4 flex items-center justify-between">
                        Learning Consistency
                        <span className="text-xs font-normal text-slate-400 uppercase tracking-widest">October</span>
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                        <div className="text-[10px] text-center text-slate-500 font-bold">M</div>
                        <div className="text-[10px] text-center text-slate-500 font-bold">T</div>
                        <div className="text-[10px] text-center text-slate-500 font-bold">W</div>
                        <div className="text-[10px] text-center text-slate-500 font-bold">T</div>
                        <div className="text-[10px] text-center text-slate-500 font-bold">F</div>
                        <div className="text-[10px] text-center text-slate-500 font-bold">S</div>
                        <div className="text-[10px] text-center text-slate-500 font-bold">S</div>
                        
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md flex items-center justify-center text-xs opacity-50">28</div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md flex items-center justify-center text-xs opacity-50">29</div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md flex items-center justify-center text-xs opacity-50">30</div>
                        <div className="aspect-square bg-primary/20 border border-primary/40 rounded-md flex items-center justify-center text-xs">1</div>
                        <div className="aspect-square bg-primary/40 border border-primary/60 rounded-md flex items-center justify-center text-xs">2</div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md flex items-center justify-center text-xs">3</div>
                        <div className="aspect-square bg-primary rounded-md flex items-center justify-center text-xs text-white shadow-lg shadow-primary/30">4</div>
                        <div className="aspect-square bg-primary/80 rounded-md flex items-center justify-center text-xs text-white">5</div>
                        <div className="aspect-square bg-primary/60 rounded-md flex items-center justify-center text-xs text-white">6</div>
                        <div className="aspect-square bg-primary rounded-md flex items-center justify-center text-xs text-white">7</div>
                        <div className="aspect-square bg-primary rounded-md flex items-center justify-center text-xs text-white">8</div>
                        <div className="aspect-square bg-primary rounded-md flex items-center justify-center text-xs text-white">9</div>
                        <div className="aspect-square bg-primary rounded-md flex items-center justify-center text-xs text-white">10</div>
                        <div className="aspect-square bg-primary rounded-md flex items-center justify-center text-xs text-white font-bold ring-2 ring-white dark:ring-primary ring-offset-2 dark:ring-offset-black">11</div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-md"></div>
                    </div>

                    <div className="mt-6 flex items-center gap-4 border-t border-slate-200 dark:border-white/10 pt-4">
                        <div className="text-center flex-1">
                            <div className="text-sm font-bold">12</div>
                            <div className="text-[10px] text-slate-500 uppercase">Current</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                        <div className="text-center flex-1">
                            <div className="text-sm font-bold text-primary">24</div>
                            <div className="text-[10px] text-slate-500 uppercase">Best</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                        <div className="text-center flex-1">
                            <div className="text-sm font-bold">92%</div>
                            <div className="text-[10px] text-slate-500 uppercase">Month</div>
                        </div>
                    </div>
                </div>

                <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl">
                    <h3 className="font-display font-bold mb-4">Mission Attempts</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <span className="material-icons-round">rocket</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold">Mars Exploration</div>
                                <div className="text-xs text-slate-500">24 Total Attempts</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-500">82%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <span className="material-icons-round">public</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold">Terraforming 101</div>
                                <div className="text-xs text-slate-500">18 Total Attempts</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-500">75%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <span className="material-icons-round">category</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold">Void Mechanics</div>
                                <div className="text-xs text-slate-500">12 Total Attempts</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-yellow-500">45%</div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 text-xs text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-1 font-bold">
                        VIEW FULL MISSION LOG <span className="material-icons-round text-xs">arrow_forward</span>
                    </button>
                </div>

                <div className="bg-card-light dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold">Galaxy Achievements</h3>
                        <span className="text-xs text-primary font-bold">12 / 48</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="min-w-[70px] flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-yellow-400 p-0.5 shadow-lg shadow-orange-500/20">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-white/20">
                                    <span className="material-icons-round text-primary text-2xl">auto_awesome</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-center font-bold uppercase text-slate-400">Streak King</span>
                        </div>
                        <div className="min-w-[70px] flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-white/5 p-0.5 opacity-40 grayscale">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-white/10">
                                    <span className="material-icons-round text-slate-500 text-2xl">speed</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-center font-bold uppercase text-slate-400">Supersonic</span>
                        </div>
                        <div className="min-w-[70px] flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-blue-400 p-0.5 shadow-lg shadow-purple-500/20">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-white/20">
                                    <span className="material-icons-round text-purple-400 text-2xl">psychology</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-center font-bold uppercase text-slate-400">Mind Reader</span>
                        </div>
                        <div className="min-w-[70px] flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 p-0.5 shadow-lg shadow-green-500/20">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-white/20">
                                    <span className="material-icons-round text-green-400 text-2xl">verified</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-center font-bold uppercase text-slate-400">Master</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer className="mt-12 py-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <span className="material-icons-round text-primary">tips_and_updates</span>
                </div>
                <div>
                    <h4 className="font-bold text-sm">Pro Tip: Fuel your engine!</h4>
                    <p className="text-xs text-slate-500">You tend to perform 15% better on Tuesday mornings.</p>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-slate-200 dark:border-white/10 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    Download Full Report
                </button>
                <button className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-primary/25">
                    Return to Mission Hub
                </button>
            </div>
        </footer>
    </main>

    <div className="fixed top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -z-10"></div>
    <div className="fixed bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
</>
  )}