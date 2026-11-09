// Thresholds and fixed lists for the frontend prototype.
// Values marked (הנחה) in spec/ are assumptions and may change after the week's data is reviewed.

export const TOPICS = {
  ai: {
    name: "AI",
    subtopics: ["models", "agents", "security", "business"], // placeholder list (הנחה)
  },
  tesla: {
    name: "Tesla",
    subtopics: ["energy", "robotaxi", "trucks", "fsd"], // placeholder list (הנחה)
  },
};

export const SUBTOPIC_LABELS = {
  models: "Models",
  agents: "Agents",
  security: "Security",
  business: "Business",
  energy: "Energy",
  robotaxi: "Robotaxi",
  trucks: "Trucks",
  fsd: "FSD",
};

// Depth levels from PRD #2: which importance levels each one shows.
export const DEPTH_LEVELS = {
  big: ["critical"],
  important: ["critical", "high"],
  all: ["critical", "high", "medium"],
};

export const BREAKING_WINDOW_HOURS = 2; // PRD #17
export const TRENDING_MIN_SOURCES = 2; // הנחה: prototype has no Hacker News points, so trending counts sources

export const PREFS_KEY = "unhyped.prefs";
