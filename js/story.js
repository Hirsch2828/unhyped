// Story page (PRD #10): what happened, why it matters, what changed, how sure we are, sources.
import { loadStory } from "./api.js";
import { el, certaintyTag, statusTags, timeAgo } from "./ui.js";

const root = document.getElementById("story");
const main = document.getElementById("main");
const errorLine = document.getElementById("story-error");
const LEVEL_LABELS = { 1: "Official", 2: "Report", 3: "Report, with care", 4: "Rumor" };
const CERTAINTY_EXPLAINED = {
  official: "Official: confirmed by an official source.",
  report: "Report: based on reporting from more than one source.",
  rumor: "Rumor: based on a single unverified source.",
};

const id = new URLSearchParams(window.location.search).get("id");

init();

async function init() {
  try {
    const story = id ? await loadStory(id) : null;
    main.setAttribute("aria-busy", "false");
    if (!story) {
      errorLine.hidden = false;
      errorLine.textContent = "This story isn't available.";
      return;
    }
    render(story);
  } catch {
    main.setAttribute("aria-busy", "false");
    errorLine.hidden = false;
    errorLine.textContent = "Couldn't load stories. Try again.";
  }
}

function render(story) {
  const nowMs = Date.now();
  document.title = `Unhyped: ${story.title}`;
  root.replaceChildren();

  root.append(statusTags(story, nowMs), el("h1", null, story.title));
  root.append(el("p", "meta", `${timeAgo(story.published_at, nowMs)} · ${story.sources.length} source${story.sources.length > 1 ? "s" : ""}`));

  // What happened
  root.append(el("h2", null, "What happened"), el("p", null, story.summary));

  // Why it matters
  const why = el("div", "block-why");
  why.append(el("h2", null, "Why it matters"), el("p", null, story.why_it_matters));
  root.append(why);

  // What changed: only when there is something to say
  if (story.what_changed) {
    root.append(el("h2", null, "What changed"), el("p", null, story.what_changed));
  }

  // How sure are we
  const sure = el("div", "sure");
  sure.append(el("h2", null, "How sure are we"), certaintyTag(story), el("p", null, CERTAINTY_EXPLAINED[story.certainty] ?? ""));
  root.append(sure);

  // Claims with source numbers
  if (story.claims?.length) {
    root.append(el("h2", null, "Claims"));
    const list = el("ol", "claims");
    story.claims.forEach((claim, index) => {
      const item = el("li", null, claim.text);
      for (const url of claim.source_urls) {
        const sup = el("sup");
        const link = el("a", null, `[${index + 1}]`);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        sup.append(link);
        item.append(document.createTextNode(" "), sup);
      }
      list.append(item);
    });
    root.append(list);
  }

  // Sources
  root.append(el("h2", null, "Sources"));
  const sources = el("ul", "sources");
  for (const src of story.sources) {
    const li = el("li");
    const link = el("a", null, src.title);
    link.href = src.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    li.append(link, el("p", "meta", `${src.source_id.replace(/_/g, " ")} · ${LEVEL_LABELS[src.level] ?? "Source"} · ${timeAgo(src.published_at, nowMs)}`));
    sources.append(li);
  }
  root.append(sources);
}
