// Home page: hero + rows, built from the mock stories and the guest's choices (PRD #6, #7).
import { loadStories } from "./api.js";
import { loadPrefs } from "./prefs.js";
import { SUBTOPIC_LABELS } from "./config.js";
import { passesDepth, isBreaking, isTrending, sortStories } from "./rules.js";
import { el, storyCard, logoBlock, statusTags } from "./ui.js";

const feed = document.getElementById("feed");
const statusLine = document.getElementById("status");
const errorLine = document.getElementById("feed-error");
const runButton = document.getElementById("run-update");

const prefs = loadPrefs();
if (!prefs || !prefs.topics?.length) {
  // No choices yet: first visit goes to onboarding (PRD #1, #2).
  window.location.replace("onboarding.html");
} else {
  init();
}

async function init() {
  const nowMs = Date.now();
  try {
    const all = await loadStories();
    const visible = sortStories(
      all.filter((s) => prefs.topics.includes(s.topic) && passesDepth(s, prefs.depth))
    );
    feed.replaceChildren();
    if (!visible.length) {
      feed.append(el("p", "empty", "Nothing important yet. That's the point."));
      return;
    }
    feed.append(buildHero(visible, nowMs));
    for (const row of buildRows(visible, all, nowMs)) feed.append(row);
  } catch (error) {
    errorLine.hidden = false;
    errorLine.textContent = "Couldn't load stories. Try again.";
    feed.replaceChildren();
  }
}

function buildHero(stories, nowMs) {
  const top = stories.find((s) => isBreaking(s, nowMs)) ?? stories[0];
  const hero = el("article", "hero");
  hero.append(logoBlock(top, "hero__img"));
  const body = el("div", "hero__body");
  body.append(
    statusTags(top, nowMs),
    el("h2", "hero__title", top.title),
    el("p", "hero__why", top.why_it_matters),
  );
  const actions = el("div", "hero__actions");
  const read = el("a", "btn btn--primary", "Read the story");
  read.href = `story.html?id=${encodeURIComponent(top.id)}`;
  const brief = el("a", "btn btn--quiet", "Your 5-minute brief");
  brief.href = "brief.html";
  actions.append(read, brief);
  body.append(actions);
  hero.append(body);
  return hero;
}

function buildRows(stories, all, nowMs) {
  const rows = [];
  const add = (title, hint, items) => {
    if (!items.length) return; // empty rows are not shown (PRD #7)
    const row = el("section", "row");
    const head = el("div", "row__head");
    head.append(el("h2", "row__title", title));
    row.append(head);
    if (hint) row.append(el("p", "row__hint", hint));
    const rail = el("div", "rail");
    rail.append(...items.map((s) => storyCard(s, nowMs)));
    row.append(rail);
    rows.push(row);
  };

  // The hero is not repeated in the first row.
  const heroId = stories.find((s) => isBreaking(s, nowMs))?.id ?? stories[0].id;
  const rest = stories.filter((s) => s.id !== heroId);

  add("Must know today", null, rest.filter((s) => s.importance === "critical" || s.importance === "high"));
  add("Trending now", null, rest.filter((s) => isTrending(s)));

  for (const subtopic of prefs.subtopics ? Object.values(prefs.subtopics).flat() : []) {
    const items = rest.filter((s) => s.subtopics.includes(subtopic));
    add(`Because you follow ${SUBTOPIC_LABELS[subtopic] ?? subtopic}`, null, items);
  }

  if (prefs.topics.includes("tesla")) {
    add("Tesla", null, rest.filter((s) => s.topic === "tesla"));
  }
  return rows;
}

// Run update now (PRD #19). The prototype has no backend, so it says so instead of pretending.
runButton.addEventListener("click", () => {
  statusLine.textContent = "Live update isn't available right now. Showing latest stories.";
});

