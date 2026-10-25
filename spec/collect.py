"""Unhyped demo collector: free sources only (RSS + Hacker News).
Collects the last N days of items into raw_items.json. No API keys, no cost.
Run:  python3 collect.py        (default 7 days)
      python3 collect.py 3      (last 3 days)
"""
import json, sys, time, re, html, urllib.request, urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 7
SINCE = datetime.now(timezone.utc) - timedelta(days=DAYS)
# The SEC asks for a contact email in the User-Agent. Put yours here before a real run.
CONTACT_EMAIL = "your-email@example.com"
UA = {"User-Agent": f"Mozilla/5.0 (Unhyped course demo; {CONTACT_EMAIL})", "Accept-Encoding": "identity"}

# source id, topic, reliability level (1 official, 2 reliable, 3 medium), url, keep-filter
# All free. Checked 28.9.2026.
RSS = [
    # --- AI: level 1, official ---
    ("openai",          "ai", 1, "https://openai.com/news/rss.xml", None),
    ("anthropic",       "ai", 1, "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml", None),  # community copy of anthropic.com/news (no official RSS)
    ("google_deepmind", "ai", 1, "https://deepmind.google/blog/rss.xml", None),
    ("google_ai",       "ai", 1, "https://blog.google/technology/ai/rss/", None),
    ("nvidia",          "ai", 1, "https://blogs.nvidia.com/feed/", None),
    ("openai_sdk",      "ai", 1, "https://github.com/openai/openai-python/releases.atom", None),        # API changes, for developers
    ("anthropic_sdk",   "ai", 1, "https://github.com/anthropics/anthropic-sdk-python/releases.atom", None),
    # --- AI: level 2, reliable journalists and experts ---
    ("techmeme",        "ai", 2, "https://www.techmeme.com/feed.xml", r"\bai\b|openai|anthropic|claude|gemini|gpt|llm|deepmind|nvidia|model"),
    ("verge_ai",        "ai", 2, "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", None),
    ("techcrunch",      "ai", 2, "https://techcrunch.com/category/artificial-intelligence/feed/", None),
    ("ars_ai",          "ai", 2, "https://arstechnica.com/ai/feed/", None),
    ("mit_tech_review", "ai", 2, "https://www.technologyreview.com/topic/artificial-intelligence/feed", None),
    ("the_decoder",     "ai", 2, "https://the-decoder.com/feed/", None),
    ("simon_willison",  "ai", 2, "https://simonwillison.net/atom/everything/", None),
    ("huggingface",     "ai", 2, "https://huggingface.co/blog/feed.xml", None),
    ("latent_space",    "ai", 3, "https://www.latent.space/feed", None),
    # --- Tesla ---
    ("tesla_sec",       "tesla", 1, "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=8-K&dateb=&owner=include&count=20&output=atom", None),  # official filings
    ("notateslaapp",    "tesla", 2, "https://www.notateslaapp.com/rss", None),   # software updates
    ("electrek",        "tesla", 2, "https://electrek.co/feed/", r"\btesla\b|\bmusk\b|cybertruck|robotaxi|\bfsd\b"),
    ("teslarati",       "tesla", 3, "https://www.teslarati.com/feed/", None),
]
HN = [  # topic, min points, keywords
    ("ai",    50, ["openai", "anthropic", "claude", "chatgpt", "gemini", "deepmind", "llm", "gpt", "mistral", "llama"]),
    ("tesla", 10, ["tesla", "robotaxi", "cybertruck"]),
]

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()

def clean(text, limit=1500):
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    return re.sub(r"\s+", " ", text).strip()[:limit]

def parse_date(s):
    if not s: return None
    try:
        d = parsedate_to_datetime(s)
    except Exception:
        try: d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception: return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)

def local(tag):
    return tag.rsplit("}", 1)[-1]

def rss_items(src, topic, level, url, keep):
    root = ET.fromstring(fetch(url))
    out = []
    for el in root.iter():
        if local(el.tag) not in ("item", "entry"): continue
        f = {}
        for c in el:
            name = local(c.tag)
            if name == "link" and c.get("href"): f.setdefault("link", c.get("href"))
            elif c.text and name not in f: f[name] = c.text
        date = parse_date(f.get("pubDate") or f.get("published") or f.get("updated") or f.get("date"))
        if not date or date < SINCE: continue
        title = clean(f.get("title"), 300)
        body = clean(f.get("description") or f.get("summary") or f.get("encoded") or f.get("content"))
        if keep and not re.search(keep, (title + " " + body).lower()): continue
        out.append({"source": src, "topic": topic, "level": level, "title": title, "text": body,
                    "url": (f.get("link") or "").strip(), "published_at": date.isoformat()})
    return out

def hn_items(topic, min_points, words):
    out, seen = [], set()
    for w in words:
        q = urllib.parse.urlencode({"query": w, "tags": "story", "hitsPerPage": 100,
            "numericFilters": f"created_at_i>{int(SINCE.timestamp())},points>={min_points}"})
        for h in json.loads(fetch("https://hn.algolia.com/api/v1/search_by_date?" + q))["hits"]:
            if h["objectID"] in seen: continue
            seen.add(h["objectID"])
            out.append({"source": "hacker_news", "topic": topic, "level": None,  # level = the linked site's level
                        "title": h.get("title") or "", "text": clean(h.get("story_text") or ""),
                        "url": h.get("url") or f"https://news.ycombinator.com/item?id={h['objectID']}",
                        "hn_points": h.get("points"), "hn_comments": h.get("num_comments"),
                        "published_at": datetime.fromtimestamp(h["created_at_i"], timezone.utc).isoformat()})
        time.sleep(0.3)
    return out

items, report = [], []
for src, topic, level, url, keep in RSS:
    try:
        got = rss_items(src, topic, level, url, keep); items += got; report.append((src, len(got), ""))
    except Exception as e:
        report.append((src, 0, f"ERROR {e}"))
for topic, min_points, words in HN:
    try:
        got = hn_items(topic, min_points, words); items += got; report.append((f"hacker_news/{topic}", len(got), ""))
    except Exception as e:
        report.append((f"hacker_news/{topic}", 0, f"ERROR {e}"))

# Merge with earlier runs, so running this once a day builds up a full week.
# RSS feeds only hold their latest 10-20 items (about 3-5 days).
try:
    old = json.load(open("raw_items.json", encoding="utf-8"))["items"]
except Exception:
    old = []
new_count = len(items)
items = old + items
# drop exact duplicate URLs (the same link from two sources or two runs); story-level merging is the AI's job
uniq, urls = [], set()
for it in sorted(items, key=lambda x: x["published_at"]):
    if it["url"] and it["url"] in urls: continue
    urls.add(it["url"]); uniq.append(it)
for n, it in enumerate(uniq, 1): it["id"] = n

json.dump({"collected_at": datetime.now(timezone.utc).isoformat(), "days": DAYS, "items": uniq},
          open("raw_items.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"Collected {new_count} items from the last {DAYS} days. Total in raw_items.json: {len(uniq)}")
for src, n, err in report: print(f"  {src:22} {n:4} {err}")
