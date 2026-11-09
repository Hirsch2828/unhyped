// Shared rendering helpers. All text goes through textContent, never innerHTML, from data files.
import { isBreaking, isTrending } from "./rules.js";

export const CERTAINTY_LABELS = {
  official: { text: "Official", cls: "tag--official", icon: "✓" },
  report: { text: "Report", cls: "tag--report", icon: "" },
  rumor: { text: "Rumor", cls: "tag--rumor", icon: "?" },
};

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function certaintyTag(story) {
  const info = CERTAINTY_LABELS[story.certainty] ?? CERTAINTY_LABELS.report;
  const tag = el("span", `tag ${info.cls}`, info.icon ? `${info.icon} ${info.text}` : info.text);
  return tag;
}

export function statusTags(story, nowMs) {
  const wrap = el("div", "tags");
  if (isBreaking(story, nowMs)) {
    const b = el("span", "tag tag--breaking");
    b.append(el("span", "dot-breaking"), document.createTextNode(" BREAKING"));
    wrap.append(b);
  } else if (isTrending(story)) {
    wrap.append(el("span", "tag tag--trending", "↑ TRENDING"));
  }
  wrap.append(certaintyTag(story));
  return wrap;
}

export function timeAgo(iso, nowMs = Date.now()) {
  const hours = Math.round((nowMs - Date.parse(iso)) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function logoBlock(story, extraClass = "card__img") {
  const block = el("div", `${extraClass} ${story.topic === "tesla" ? "logo-placeholder--tesla" : "logo-placeholder--ai"}`);
  const mark = el("span", "logo-placeholder", story.topic === "tesla" ? "T" : "AI");
  mark.setAttribute("role", "img");
  mark.setAttribute("aria-label", story.topic === "tesla" ? "Tesla logo" : "AI logo");
  block.append(mark);
  return block;
}

export function storyCard(story, nowMs) {
  const link = el("a", "card");
  link.href = `story.html?id=${encodeURIComponent(story.id)}`;
  link.append(logoBlock(story));
  const body = el("div", "card__body");
  body.append(statusTags(story, nowMs), el("h3", "card__title", story.title));
  const meta = el("p", "meta card__meta", `${story.sources[0]?.title ? sourceName(story) : ""} · ${timeAgo(story.published_at, nowMs)} · ${story.sources.length} source${story.sources.length > 1 ? "s" : ""}`);
  body.append(meta);
  link.append(body);
  return link;
}

function sourceName(story) {
  return story.sources[0].source_id.replace(/_/g, " ");
}

export function showStatus(node, text) {
  node.textContent = text;
}
