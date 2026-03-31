"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LessonTabs({ content }) {
  if (!content) return null;

  // Normalize newlines to make splitting consistent
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const tabs = [];
  let currentTab = { id: "tab-0", title: "Overview", content: [] };
  let tabCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if line is a Heading 2 or Heading 3
    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (match) {
      // If we found a heading, finish the current tab and start a new one
      if (currentTab.content.length > 0 || currentTab.id !== "tab-0") {
        currentTab.content = currentTab.content.join("\n").trim();
        // Only push if there's actual content or title is meaningful
        if (currentTab.content || currentTab.title !== "Overview") {
          tabs.push(currentTab);
        }
      }
      
      currentTab = {
        id: `tab-${tabCounter++}`,
        title: match[2].trim(), // The text of the heading without ##
        content: [], // We omit the heading itself from the tab body
      };
    } else {
      currentTab.content.push(line);
    }
  }

  // Push the final tab
  currentTab.content = currentTab.content.join("\n").trim();
  if (currentTab.content || tabs.length === 0) {
    tabs.push(currentTab);
  }

  // Active state
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || "tab-0");
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // If there's 1 or zero tabs after parsing, just render normally
  if (tabs.length <= 1) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-6 md:p-8 w-full overflow-hidden prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary hover:prose-a:text-orange-600 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-primary text-slate-700 dark:text-slate-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Tabs Navigation ── */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-2 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md shadow-inner">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-display font-medium text-sm md:text-base transition-all duration-300 ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-primary shadow-md shadow-primary/20 border border-primary/30 scale-100"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-primary to-orange-400 shadow-[0_0_10px_rgba(255,107,0,0.8)] animate-pulse" />
                )}
                {tab.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 md:p-8 w-full overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all duration-500 min-h-[300px]">
        {/* We dynamically fade the content via key to re-mount the text slightly for perceived responsiveness */}
        <div key={activeTab.id} className="animate-in fade-in slide-in-from-right-2 duration-300">
          <h3 className="font-display text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent mb-6 inline-block">
            {activeTab.title}
          </h3>
          <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none 
                          prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100
                          prose-h2:text-2xl prose-h3:text-xl 
                          prose-a:text-primary hover:prose-a:text-orange-600 
                          prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/10 prose-blockquote:to-transparent prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-sm prose-blockquote:font-medium prose-blockquote:text-slate-800 prose-blockquote:dark:text-slate-200 
                          prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-primary/70 
                          prose-strong:text-primary/90 prose-strong:font-bold
                          text-slate-700 dark:text-slate-300 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeTab.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
