# Unhyped

Calm editorial intelligence in a world of noisy technology news. A demo that collects AI and Tesla news, merges duplicates into single stories, ranks them, and shows a short daily brief.

## How it's built

- **Frontend:** static HTML, CSS and JavaScript on GitHub Pages (no framework, no build step).
- **Backend:** one Vercel function in `api/`.
- **Data:** Supabase.
- **Automations and AI:** n8n calls Gemini Flash to filter and write stories.

## Keys

This repo is public. No key ever goes in it. Secret keys live only in n8n Credentials and in Vercel environment variables. The Supabase public key is the only exception, and it's protected by table permissions (RLS).

## Specs

Product, architecture, design and milestones are in `spec/`.
