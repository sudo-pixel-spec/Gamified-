/**
 * Badge Definitions - Frontend Representation
 * 
 * Since the backend manages badges via Admin, this shared config 
 * maps the badge keys (like 'FIRST_FLIGHT') to their visual assets 
 * and descriptions for the student-facing UI.
 */

export const BADGE_DEFINITIONS = {
  FIRST_FLIGHT: {
    id: "FIRST_FLIGHT",
    name: "First Flight",
    description: "Successfully launched your first learning voyage.",
    icon: "rocket_launch",
    color: "from-orange-500 to-yellow-300",
    shadow: "shadow-orange-500/30",
    iconColor: "text-orange-400"
  },
  ON_FIRE: {
    id: "ON_FIRE",
    name: "On Fire",
    description: "Maintained a 3-day learning streak. Keep it cool!",
    icon: "local_fire_department",
    color: "from-red-500 to-orange-400",
    shadow: "shadow-red-500/30",
    iconColor: "text-red-400"
  },
  MASTERY: {
    id: "MASTERY",
    name: "Mastery",
    description: "Achieved a perfect 100% score on a challenging quiz.",
    icon: "military_tech",
    color: "from-yellow-400 to-amber-600",
    shadow: "shadow-yellow-500/30",
    iconColor: "text-yellow-400"
  },
  ALL_STARS: {
    id: "ALL_STARS",
    name: "All Stars",
    description: "Consistency is key! You reached a 7-day streak milestone.",
    icon: "stars",
    color: "from-purple-500 to-pink-300",
    shadow: "shadow-purple-500/20",
    iconColor: "text-purple-400"
  },
  DIAMOND_MINER: {
    id: "DIAMOND_MINER",
    name: "Diamond Miner",
    description: "Collected 10 mastery diamonds from hard-mode sessions.",
    icon: "diamond",
    color: "from-blue-400 to-cyan-300",
    shadow: "shadow-blue-500/30",
    iconColor: "text-blue-400"
  },
  SCHOLAR: {
    id: "SCHOLAR",
    name: "Scholar",
    description: "Completed 5 full lessons in a single subject area.",
    icon: "menu_book",
    color: "from-emerald-500 to-teal-300",
    shadow: "shadow-emerald-500/30",
    iconColor: "text-emerald-400"
  }
};

/**
 * Returns the badge definition for a given ID or a default 'locked' placeholder.
 */
export function getBadgeDetails(badgeId) {
  return BADGE_DEFINITIONS[badgeId] || {
    id: badgeId,
    name: "Unknown Achievement",
    description: "A mysterious milestone you've reached.",
    icon: "question_mark",
    color: "from-gray-500 to-gray-400",
    shadow: "shadow-gray-500/20",
    iconColor: "text-gray-400"
  };
}
