"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch, getToken } from "../lib/api";
import { getChatHistory, saveChatHistory } from "../lib/chat-storage";
import { useRouter, usePathname } from "next/navigation";

// ── Formatting helper from chat/page.jsx ──
function formatText(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-bold text-primary">{p.slice(2,-2)}</strong>
      : p
  );
}

// ── Bubble component (mini version) ──
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
        isUser ? "bg-[#FF6B00] text-white" : "bg-[#1a1a1a] border border-[#FF6B00]/30 text-[#FF6B00]"
      }`}>
        {isUser ? <span className="material-symbols-outlined text-xs">person</span> : "🚀"}
      </div>
      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
        isUser
          ? "bg-[#FF6B00] text-white rounded-tr-sm shadow-lg shadow-primary/10"
          : "bg-[#111] border border-white/10 text-slate-200 rounded-tl-sm"
      }`}>
        {msg.content.split("\n").map((line, i) => (
          <span key={i}>{formatText(line)}{i < msg.content.split("\n").length-1 && <br/>}</span>
        ))}
      </div>
    </div>
  );
}

// ── Typing indicator (mini version) ──
function Typing() {
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center text-[10px]">🚀</div>
      <div className="bg-[#111] border border-white/10 px-3 py-2 rounded-xl rounded-tl-sm flex items-center gap-1">
        {[0,150,300].map(d=>(
          <span key={d} className="w-1.5 h-1.5 bg-[#FF6B00]/60 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>
        ))}
      </div>
    </div>
  );
}

export default function FloatingChatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Hidden on admin, login, etc.
  const isHidden = !pathname || pathname.startsWith("/admin") || pathname === "/login" || pathname === "/otp" || pathname === "/completeprofile" || pathname === "/signup";

  // Load history on mount
  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  // Sync scroll on change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
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
      // Using existing chat page logic: POST /v1/ai/chat with { message: text }
      const res = await apiFetch(`/v1/ai/chat`, {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });

      const replyText = res?.reply ?? res?.message ?? res?.data?.reply ?? "Signal received! (TODO: Real AI stream coming soon)";
      const assistantMsg = { role: "assistant", content: replyText, ts: Date.now() };
      const finalized = [...updatedWithUser, assistantMsg];
      setMessages(finalized);
      saveChatHistory(finalized);
    } catch (e) {
      if (e.message?.includes("429")) {
        setError("Daily AI limit reached, Cadet! 🌙");
      } else {
        setError("Signal lost. (TODO: Check AI route)");
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (isHidden) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      <div className="relative w-full h-full">
        {/* Chat Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-44 right-6 w-[320px] sm:w-[360px] h-[480px] bg-[#0A0A0A] border border-orange-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#0F0F0F] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-orange-900 flex items-center justify-center text-sm shadow-lg shadow-primary/20">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight uppercase">AI BUDDY</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-white/40 uppercase font-black">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => router.push("/chat")}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-primary"
                    title="Open Full Chat"
                  >
                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/20 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 scrollbar-hide"
              >
                {messages.map((m, i) => <Bubble key={i} msg={m} />)}
                {loading && <Typing />}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-[11px] text-red-400 flex items-center gap-2 animate-shake">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {error}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#0F0F0F] border-t border-white/10">
                <div className="flex items-end gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-all shadow-inner">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 resize-none max-h-24 outline-none py-1"
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-40 shrink-0"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draggable Button */}
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ top: -500, bottom: 0, left: -1000, right: 0 }}
          className="absolute bottom-24 right-6 pointer-events-auto"
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 bg-gradient-to-tr from-[#FF6B00] to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing border-2 border-white/10 z-50 group"
          >
            <span className="material-symbols-outlined text-white text-3xl group-hover:rotate-12 transition-transform">rocket_launch</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
