"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, apiFetch } from "../../lib/api";
import { getChatHistory, saveChatHistory, clearChatHistory } from "../../lib/chat-storage";

// ── Suggested prompts ────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Explain orbital mechanics in simple terms",
  "Quiz me on Quantum Physics",
  "Why do I keep getting Rocket Fuel Chemistry wrong?",
  "Help me understand exoplanet discovery",
];

// ── Formatting helper: bold **text** ────────────────────────────────────────────────────────
function formatText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2,-2)}</strong>
      : p
  );
}

// ── Bubble component ─────────────────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isUser ? "bg-[#FF6B00] text-white" : "bg-[#1a1a1a] border border-[#FF6B00]/30 text-[#FF6B00]"
      }`}>
        {isUser ? <span className="material-icons-round text-sm">person</span> : "🚀"}
      </div>
      {/* Text */}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? "bg-[#FF6B00] text-white rounded-tr-sm"
          : "bg-[#111] border border-white/10 text-slate-200 rounded-tl-sm"
      }`}>
        {msg.content.split("\n").map((line, i) => (
          <span key={i}>{formatText(line)}{i < msg.content.split("\n").length-1 && <br/>}</span>
        ))}
        <div className={`text-[10px] mt-1.5 ${isUser?"text-white/50":"text-slate-600"}`}>
          {new Date(msg.ts).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ─────────────────────────────────────────────────────────────────────────
function Typing() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center text-xs">🚀</div>
      <div className="bg-[#111] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        {[0,150,300].map(d=>(
          <span key={d} className="w-2 h-2 bg-[#FF6B00]/60 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const router  = useRouter();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Load history on mount
  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auth guard
  useEffect(() => {
    if (!getToken()) router.push("/login");
  }, [router]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");

    const userMsg = { role: "user", content: trimmed, ts: Date.now() };
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    saveChatHistory(updatedWithUser);
    setLoading(true);

    try {
      const res = await apiFetch(`/v1/ai/chat`, {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });

      const data = res;
      const replyText = data?.reply ?? data?.message ?? "Mission control received your message!";
      const assistantMsg = { role: "assistant", content: replyText, ts: Date.now() };
      const finalized = [...updatedWithUser, assistantMsg];

      setMessages(finalized);
      saveChatHistory(finalized);
    } catch (e) {
      if (e.message?.includes("429")) {
        setRateLimited(true);
        setError("You've reached your daily AI message limit. Come back tomorrow, Cadet! 🌙");
      } else if (e.message?.includes("403")) {
        setError("Mission locked: Please complete your profile first!");
      } else {
        setError(e.message || "Signal lost. (Check AI route)");
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>

      <style>{`
        .chat-bg {
          background-color:#050505;
          background-image:radial-gradient(circle at 2px 2px,rgba(255,255,255,.03) 1px,transparent 0);
          background-size:40px 40px;
        }
        .fdisplay{font-family:'Space Grotesk',sans-serif}
        .msg-area::-webkit-scrollbar{width:4px}
        .msg-area::-webkit-scrollbar-track{background:transparent}
        .msg-area::-webkit-scrollbar-thumb{background:#FF6B00/30;border-radius:4px}
        textarea:focus{outline:none}
      `}</style>

      <div className="chat-bg min-h-screen flex flex-col" style={{fontFamily:"'Outfit',sans-serif"}}>

        {/* ── Nav ── */}
        <nav className="border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between h-16 items-center">
            <button onClick={()=>router.push("/dashboard")} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <span className="material-icons-round text-white text-xl">rocket_launch</span>
              </div>
              <span className="fdisplay font-bold text-xl tracking-tight text-white uppercase tracking-wider">AI<span className="text-[#FF6B00]">BUDDY</span></span>
            </button>

            <div className="hidden md:flex items-center gap-8 text-sm">
              {[["Dashboard","/dashboard"],["Courses","/subjects"],["Analytics","/analytics"],["Leaderboard","/leaderboard"]].map(([l,h])=>(
                <a key={l} href={h} className={h==="/chat"?"text-[#FF6B00] font-semibold border-b-2 border-[#FF6B00] pb-0.5":"text-slate-400 hover:text-[#FF6B00] transition-colors"}>{l}</a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                <span className="text-green-400 text-xs font-bold">AI Online</span>
              </div>
            </div>
          </div>
        </nav>

        {/* ── Body ── */}
        <div className="flex flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 gap-6 relative z-10">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
              <h3 className="fdisplay font-bold text-sm mb-3 flex items-center gap-2">
                <span className="material-icons-round text-[#FF6B00] text-base">auto_fix_high</span>
                Quick Prompts
              </h3>
              <div className="space-y-2">
                {SUGGESTIONS.map(s=>(
                  <button
                    key={s}
                    onClick={()=>sendMessage(s)}
                    disabled={loading||rateLimited}
                    className="w-full text-left text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-[#FF6B00]/10 border border-white/5 hover:border-[#FF6B00]/30 rounded-lg px-3 py-2.5 transition-all disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
              <h3 className="fdisplay font-bold text-sm mb-3 flex items-center gap-2">
                <span className="material-icons-round text-[#FF6B00] text-base">info</span>
                About AI Buddy
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your AI tutor is powered by advanced language models. Ask questions, request quizzes, or get topic explanations.
                <br/><br/>
                Rate limits apply to keep the experience fair for all cadets.
              </p>
            </div>

            <button
              onClick={()=>router.push("/analytics")}
              className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-sm font-bold rounded-xl px-4 py-3 hover:bg-[#FF6B00]/20 transition-all flex items-center gap-2"
            >
              <span className="material-icons-round text-base">bar_chart</span>
              View My Analytics
            </button>
          </aside>

          {/* ── Chat panel ── */}
          <div className="flex-1 flex flex-col bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden" style={{minHeight:"calc(100vh - 140px)"}}>

            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#0F0F0F]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-orange-900 flex items-center justify-center text-xl">
                🚀
              </div>
              <div>
                <div className="font-bold fdisplay text-base uppercase">AI BUDDY</div>
                <div className="text-xs text-slate-500">Powered by advanced reasoning • Ask anything</div>
              </div>
                <button
                onClick={() => {
                  clearChatHistory();
                  setMessages(getChatHistory());
                }}
                className="ml-auto text-slate-600 hover:text-slate-300 transition-colors"
                title="Clear chat"
              >
                <span className="material-icons-round text-xl">refresh</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 msg-area" style={{maxHeight:"calc(100vh - 290px)"}}>
              {messages.map((m, i) => <Bubble key={i} msg={m}/>)}
              {loading && <Typing/>}

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                  <span className="material-icons-round text-base mt-0.5">warning</span>
                  {error}
                </div>
              )}

              <div ref={bottomRef}/>
            </div>

            {/* Mobile suggestions */}
            <div className="flex gap-2 px-4 py-2 overflow-x-auto lg:hidden border-t border-white/5">
              {SUGGESTIONS.map(s=>(
                <button
                  key={s}
                  onClick={()=>sendMessage(s)}
                  disabled={loading||rateLimited}
                  className="flex-shrink-0 text-xs text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-full px-3 py-1.5 hover:bg-[#FF6B00]/20 transition-all disabled:opacity-40"
                >
                  {s.length>30?s.slice(0,28)+"…":s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-4 py-4 bg-[#0F0F0F]">
              {rateLimited ? (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500">Daily limit reached. Your learning orbit resets tomorrow! 🌙</p>
                  <button onClick={()=>router.push("/analytics")} className="text-[#FF6B00] text-sm font-bold mt-2 hover:underline">
                    View your progress →
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-3 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#FF6B00]/50 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your AI tutor anything…"
                    rows={1}
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none max-h-32 leading-relaxed disabled:opacity-50"
                    style={{outline:"none",border:"none",boxShadow:"none"}}
                    onInput={e=>{e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px"}}
                  />
                  <button
                    onClick={()=>sendMessage(input)}
                    disabled={!input.trim()||loading}
                    className="w-9 h-9 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      : <span className="material-icons-round text-lg">send</span>
                    }
                  </button>
                </div>
              )}
              <p className="text-[10px] text-slate-700 mt-2 text-center">Press Enter to send • Shift+Enter for new line</p>
            </div>
          </div>

        </div>
      </div>

      {/* Ambient glows */}
      <div className="fixed top-20 right-10 w-40 h-40 bg-[#FF6B00]/5 rounded-full blur-[80px] pointer-events-none -z-10"/>
      <div className="fixed bottom-20 left-10 w-56 h-56 bg-[#FF6B00]/4 rounded-full blur-[100px] pointer-events-none -z-10"/>
    </>
  );
}