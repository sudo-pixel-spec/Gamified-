"use client";

import React from "react";

export default function ManagementGrid({ groups, user, onOpenArea }) {
  return (
    <section className="space-y-8">
      {groups.map((group) => {
        const isSuper = user?.role === "admin" && (user?.adminType === "super" || !user?.adminType);
        if (group.superOnly && !isSuper) return null;

        const visibleItems = group.items.filter(item => {
          if (item.superOnly && !isSuper) return false;
          return true;
        });

        if (visibleItems.length === 0) return null;

        return (
          <div key={group.id} className="space-y-4">
            <h2 className="text-lg font-bold px-1 border-l-4 border-orange-500 pl-3">{group.label}</h2>
            <div className="grid grid-cols-2 gap-3">
              {visibleItems.map((area) => (
                <button
                  key={area.key}
                  onClick={() => onOpenArea(area)}
                  className="flex flex-col items-start gap-3 rounded-xl border border-orange-500/10 bg-[#141414] p-5 hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95 group text-left"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">{area.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{area.label}</span>
                    {area.superOnly && (
                      <span className="text-[10px] font-bold text-orange-500/50 uppercase">Super</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
