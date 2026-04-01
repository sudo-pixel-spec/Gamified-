/**
 * chat-storage.js
 * Utility to manage localized chat history between the floating chatbot and full-screen chat page.
 */

const STORAGE_KEY = "astro_ai_history";

const DEFAULT_MESSAGE = {
  role: "assistant",
  content: "Hello, Space Cadet! 🚀\n\nI'm your AI buddy. Ask me anything about this lesson or request a practice session!",
  ts: Date.now(),
};

/**
 * Get current chat history or default greeting
 */
export function getChatHistory() {
  if (typeof window === "undefined") return [DEFAULT_MESSAGE];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [DEFAULT_MESSAGE];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_MESSAGE];
  } catch (e) {
    console.error("Failed to load chat history", e);
    return [DEFAULT_MESSAGE];
  }
}

/**
 * Save full conversation history
 */
export function saveChatHistory(messages) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save chat history", e);
  }
}

/**
 * Clear chat history
 */
export function clearChatHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Add a single message to history
 */
export function addChatMessage(msg) {
  const current = getChatHistory();
  const updated = [...current, { ...msg, ts: msg.ts || Date.now() }];
  saveChatHistory(updated);
  return updated;
}
