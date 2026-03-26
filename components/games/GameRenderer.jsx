"use client";
import DataVerseGame from "./DataVerseGame";

export default function GameRenderer({ game, lessonId }) {
  const { gameType, gameData } = game;

  if (!gameType) return null;

  if (gameType === "data-verse") {
    return <DataVerseGame xp={gameData?.xp ?? 95} />;
  }

  if (gameType === "quiz") {
    return (
      <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-sm text-orange-700 dark:text-orange-300">
        🧠 Quiz: {game.prompt} — renderer coming soon
      </div>
    );
  }

  if (gameType === "drag-drop") {
    return (
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-sm text-purple-700 dark:text-purple-300">
        🧩 Drag & Drop: {game.prompt} — renderer coming soon
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-slate-500">
      Unsupported game type: {gameType}
    </div>
  );
}