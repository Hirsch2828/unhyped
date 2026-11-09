// Daily brief (PRD #12): a short printed-style read with a clear end.
import { loadBrief } from "./api.js";
import { el } from "./ui.js";

const itemsRoot = document.getElementById("brief-items");
const errorLine = document.getElementById("brief-error");
const progress = document.getElementById("progress");

init();

async function init() {
  try {
    const brief = await loadBrief();
    document.getElementById("brief-date").textContent = formatDate(brief.date);
    document.getElementById("brief-count").textContent = String(brief.items.length);
    for (const item of brief.items) {
      const section = el("article", "brief-item");
      section.append(el("p", "meta", item.importance === "critical" ? "Critical" : "High"), el("h2", null, item.title), el("p", null, item.summary));
      const why = el("div", "block-why");
      why.append(el("p", null, item.why_it_matters));
      section.append(why);
      itemsRoot.append(section);
    }
    updateProgress();
  } catch {
    errorLine.hidden = false;
    errorLine.textContent = "Couldn't load stories. Try again.";
  }
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

// Thin progress bar at the top of the page.
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 1;
  progress.style.width = `${Math.round(ratio * 100)}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
