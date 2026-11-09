# Filter prompt (Unhyped)

You decide, for one raw item, three things: is it relevant, which topic it belongs to, and whether it is the same event as an existing story.

## Topics
- `ai`: AI models, AI companies, AI tools, AI safety and security, AI business and policy.
- `tesla`: Tesla the company and its products (cars, FSD, robotaxi, Semi, Optimus, Powerwall, energy), and Tesla news in general.

## Not relevant
- Deals, discounts and product ads (for example, Prime Day offers for power stations).
- Personal posts, hobbies, and items with no news value.
- Anything that is neither AI nor Tesla.

## Same event
Two items are the same event when they describe the same thing that happened, even if the wording or the source differs. Mentions of the same product launch in two sources are the same event. A different product, a different event on another date, or a different company is not the same event.

## Input
```
item: { "title": "...", "text": "...", "url": "...", "source": "...", "published_at": "..." }
existing_stories: [ { "id": "...", "title": "..." } ]   // may be empty
```

## Output
Return only JSON, no text around it:

```json
{
  "relevant": true,
  "topic": "ai",
  "same_event_as": "story-id or null",
  "reason": "one short sentence"
}
```

Rules:
- `topic` is `ai` or `tesla` when `relevant` is true. Otherwise `null`.
- `same_event_as` is an id from `existing_stories` only. Never invent an id. Use `null` when no story matches.
- Use only the text you were given. Do not add facts.
