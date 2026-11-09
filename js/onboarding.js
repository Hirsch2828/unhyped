// Onboarding (PRD #2): topics, parts of each topic, depth. Guest choices are saved in this browser only.
import { TOPICS, SUBTOPIC_LABELS } from "./config.js";
import { loadPrefs, savePrefs } from "./prefs.js";
import { el } from "./ui.js";

const steps = ["welcome", "topics", "subtopics", "depth"];
const state = { topics: [], subtopics: {}, depth: "important" };

// Start from earlier choices if the guest comes back to change them.
const saved = loadPrefs();
if (saved) Object.assign(state, saved);

const topicChoices = document.getElementById("topic-choices");
const subtopicGroups = document.getElementById("subtopic-groups");

// Topics
for (const [key, topic] of Object.entries(TOPICS)) {
  const button = el("button", "big-choice");
  button.type = "button";
  button.setAttribute("aria-pressed", String(state.topics.includes(key)));
  button.dataset.topic = key;
  button.append(el("span", "big-choice__name", topic.name));
  button.addEventListener("click", () => {
    toggle(state.topics, key);
    button.setAttribute("aria-pressed", String(state.topics.includes(key)));
    document.getElementById("topic-error").hidden = true;
  });
  topicChoices.append(button);
}

// Subtopics: one group per chosen topic, rebuilt when the topic choice changes.
function renderSubtopics() {
  subtopicGroups.replaceChildren();
  for (const key of state.topics) {
    const group = el("div");
    group.append(el("h2", "row__title", TOPICS[key].name));
    const chips = el("div", "chips");
    for (const sub of TOPICS[key].subtopics) {
      const chip = el("button", "chip", SUBTOPIC_LABELS[sub] ?? sub);
      chip.type = "button";
      const picked = (state.subtopics[key] ?? []).includes(sub);
      chip.setAttribute("aria-pressed", String(picked));
      chip.addEventListener("click", () => {
        state.subtopics[key] = state.subtopics[key] ?? [];
        toggle(state.subtopics[key], sub);
        chip.setAttribute("aria-pressed", String(state.subtopics[key].includes(sub)));
        document.getElementById("subtopic-error").hidden = true;
      });
      chips.append(chip);
    }
    group.append(chips);
    subtopicGroups.append(group);
  }
}

// Depth
const depthButtons = [...document.querySelectorAll("[data-depth]")];
function paintDepth() {
  for (const b of depthButtons) b.setAttribute("aria-checked", String(b.dataset.depth === state.depth));
}
depthButtons.forEach((b) => b.addEventListener("click", () => { state.depth = b.dataset.depth; paintDepth(); }));
paintDepth();

// Navigation between steps
let current = "welcome";
function show(name) {
  current = name;
  for (const s of document.querySelectorAll("[data-step]")) s.hidden = s.dataset.step !== name;
  if (name === "subtopics") renderSubtopics();
  document.querySelector(`[data-step="${name}"] h1`)?.setAttribute("tabindex", "-1");
  document.querySelector(`[data-step="${name}"] h1`)?.focus();
}

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const next = steps[steps.indexOf(current) + 1];
    if (current === "topics" && state.topics.length === 0) {
      document.getElementById("topic-error").hidden = false;
      return;
    }
    if (current === "subtopics") {
      const missing = state.topics.some((t) => !(state.subtopics[t]?.length));
      if (missing) {
        document.getElementById("subtopic-error").hidden = false;
        return;
      }
    }
    if (current === "depth") {
      finish();
      return;
    }
    show(next);
  });
});

function finish() {
  // Drop subtopics of topics that were unchecked.
  for (const key of Object.keys(state.subtopics)) {
    if (!state.topics.includes(key)) delete state.subtopics[key];
  }
  savePrefs({ topics: state.topics, subtopics: state.subtopics, depth: state.depth });
  window.location.href = "index.html";
}

function toggle(list, value) {
  const i = list.indexOf(value);
  if (i >= 0) list.splice(i, 1);
  else list.push(value);
}
