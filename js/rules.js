// Pure functions: rules computed in code, not by the model (PRD #17, ARCHITECTURE).
import { DEPTH_LEVELS, BREAKING_WINDOW_HOURS, TRENDING_MIN_SOURCES } from "./config.js";

const IMPORTANCE_RANK = { critical: 0, high: 1, medium: 2, low: 3, ignore: 4 };

export function importanceRank(importance) {
  return IMPORTANCE_RANK[importance] ?? 99;
}

// Does a story pass the reader's depth choice (PRD #2)?
export function passesDepth(story, depth) {
  const allowed = DEPTH_LEVELS[depth] ?? DEPTH_LEVELS.important;
  return allowed.includes(story.importance);
}

// Breaking (PRD #17): critical, plus either one level-1 source or two independent level-2 sources, published in the last 2 hours.
export function isBreaking(story, nowMs = Date.now()) {
  if (story.importance !== "critical") return false;
  const ageHours = (nowMs - Date.parse(story.published_at)) / 3_600_000;
  if (!(ageHours >= 0 && ageHours <= BREAKING_WINDOW_HOURS)) return false;
  const hasLevel1 = story.sources.some((s) => s.level === 1);
  const level2Sources = new Set(story.sources.filter((s) => s.level === 2).map((s) => s.source_id));
  return hasLevel1 || level2Sources.size >= 2;
}

// Trending (PRD #17), prototype version: the story appears in enough distinct sources.
export function isTrending(story) {
  const distinct = new Set(story.sources.map((s) => s.source_id));
  return distinct.size >= TRENDING_MIN_SOURCES;
}

// Sort: most important first, then newest.
export function sortStories(stories) {
  return [...stories].sort((a, b) => {
    const byImportance = importanceRank(a.importance) - importanceRank(b.importance);
    if (byImportance !== 0) return byImportance;
    return Date.parse(b.published_at) - Date.parse(a.published_at);
  });
}
