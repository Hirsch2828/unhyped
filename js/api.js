// Prototype data access. Reads the mock files in data/ (no backend yet).
// Later milestones swap these functions for calls to /api/... (ARCHITECTURE.md).

export async function loadStories() {
  const response = await fetch("data/mock-stories.json");
  if (!response.ok) throw new Error(`Stories failed: ${response.status}`);
  const json = await response.json();
  return json.stories;
}

export async function loadStory(id) {
  const stories = await loadStories();
  return stories.find((s) => s.id === id) ?? null;
}

export async function loadBrief() {
  const response = await fetch("data/mock-brief.json");
  if (!response.ok) throw new Error(`Brief failed: ${response.status}`);
  return response.json();
}
