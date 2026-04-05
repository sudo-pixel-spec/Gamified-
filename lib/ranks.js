/**
 * 👑 Centralized Rank System
 * Maps XP to tactical rank titles.
 */
export const RANK_STEPS = [
  { xp: 0,     label: "Planetary Scout",  icon: "public",          color: "text-blue-400" },
  { xp: 5000,  label: "Nova Commander",   icon: "military_tech",   color: "text-orange-400" },
  { xp: 15000, label: "Solar Zenith",     icon: "wb_sunny",        color: "text-yellow-400" },
  { xp: 35000, label: "Galactic Sentinel",icon: "security",        color: "text-purple-400" },
  { xp: 75000, label: "Universal Warden", icon: "auto_awesome",    color: "text-white" },
];

export function getRankInfo(totalXP = 0) {
  // Find the highest step the user has passed
  for (let i = RANK_STEPS.length - 1; i >= 0; i--) {
    if (totalXP >= RANK_STEPS[i].xp) {
      return RANK_STEPS[i];
    }
  }
  return RANK_STEPS[0];
}
