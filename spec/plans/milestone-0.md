# Milestone 0 plan: Infrastructure

> Source: MILESTONES.md (M0), ARCHITECTURE.md §2 and §8 (keys), tech-stack.md, course-stack.md ("iron law: keys"), DESIGN.md §2–3.
> Goal: every tool is connected, with no features yet. The repo root is the project folder.

## 1. What Claude builds (code)

Only the files M0 needs. The other folders in ARCHITECTURE.md §2 (`js/`, `data/`, `prompts/`, `n8n/`, `supabase/`, `api/`, `assets/`) are created by the milestone that first puts a real file in them. Git doesn't keep empty folders, so placeholders would add nothing.

| File | Contents |
|---|---|
| `index.html` | `lang="en" dir="ltr"`, viewport meta, title "Unhyped", Google Fonts link (Manrope 600/700, Inter 400/500/600), link to `css/style.css`. Body: a centered "Unhyped" wordmark (Manrope 700) and the line "Calm editorial intelligence in a world of noisy technology news." (Inter 400). Nothing else. |
| `css/style.css` | Design tokens from DESIGN.md as CSS variables: `--cream #F5F1E8`, `--olive #66705A`, `--terracotta #C86F4A`, `--charcoal #242522`, `--breaking-red #D6423A`, `--white #FFFFFF`. Font variables, 8px spacing scale, 12px card radius, 999px chip radius. Base styles only: body on cream, charcoal text, Inter 16px / 1.6, Manrope headings, 16px side margin (32px at ≥768px), max width 1200px. |
| `package.json` | `{ "name": "unhyped", "private": true, "type": "module" }`. No dependencies. |
| `README.md` | Short: what Unhyped is, the three layers (GitHub Pages / Vercel / Supabase + n8n + Gemini), "no keys in the repo", and where the specs live (`spec/`). |
| `.gitignore` | Already exists. Add the two folders from §4 if you approve. |

- No `.env` / `.env.example` in M0. No key is used locally. Keys live only in n8n Credentials and in Vercel environment variables (ARCHITECTURE.md §8).
- No `vercel.json`. Vercel's default settings for a static site with an `api/` folder are enough.

## 2. What you do (accounts), step by step

Claude guides you through each step in plain language. You click, Claude checks the result where it can. Nothing here is pasted into the repo or the chat.

1. **GitHub:** create a **public** repo (suggested name `unhyped`) with no README. Give Claude its address.
2. **GitHub Pages** (after the first push): repo → Settings → Pages → "Deploy from a branch" → `main` / root. Wait for the URL (`https://<user>.github.io/unhyped/`).
3. **Vercel:** "Add New Project" → import the GitHub repo → Framework preset "Other" → Deploy. No environment variables yet. Those come in M5.
4. **Supabase:** new project, suggested name `unhyped`, a region close to you (e.g. Frankfurt). Save the database password in your password manager. No tables yet. Those come in M2.
5. **Gemini:** in Google AI Studio, create an API key (free tier). Don't paste it anywhere except n8n.
6. **n8n:** in your n8n instance → Credentials:
   - **Google Gemini (PaLM) API**: the Gemini key.
   - **Supabase API**: the project URL + the **secret** key (Project Settings → API Keys). Not the public one.
   - Test each credential with n8n's "Test" button.

## 3. Push (needs your approval)

M0's done-criterion ("the site is live on GitHub Pages") requires a push. So the order is:
1. Claude writes the files and checks them locally.
2. Claude stops and asks for approval to push, with the repo address you gave.
3. On approval: `git init`, connect the repo, a safety scan (below), commit, push to `main`.
4. You turn on Pages (step 2.2). Claude opens the URL and checks it.

**Safety scan before every push:** search the committed files for key patterns (`AIza`, `sb_secret_`, `service_role`, `eyJ`, `sk-`, `password`). Any match blocks the push.

## 4. Open decision: what goes into the public repo

The project folder also holds two folders that aren't part of the app:
- `claude/`: the original copies of the spec files. Everything in it is now also in `spec/`.
- `למוצר האמיתי/`: notes for the real (Hebrew) product.

**Proposal:** add both to `.gitignore`. They stay on your computer and don't go public. `spec/` does go into the repo, because n8n and the build need it and it has no secrets. Note that `spec/raw_items.json` is a week of public news and is fine to publish.

## 5. Definition of Done: how it's checked

| Criterion | Check |
|---|---|
| The site is live at the GitHub Pages URL | Claude opens the URL: cream background, "Unhyped" in Manrope, the tagline in Inter, no console errors. Also checked at 375px. |
| No key is in the repo | The safety scan (§3) on the pushed files returns nothing. |
| (Supporting) Vercel, Supabase, n8n connected | Vercel shows a successful deploy of the same commit. The Supabase project is "Active". Both n8n credentials pass "Test". You confirm these, since Claude can't see your accounts. |
