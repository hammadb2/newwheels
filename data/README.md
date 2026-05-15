# `data/` — operator-managed JSON files

Everything in this directory is read at build time by the Next.js app.

## `drafts/`

Claude-generated resource drafts produced by `/admin/content`. Each file is
one draft. The admin UI lets you edit and publish them. Publishing moves the
draft into `src/content/resources/generated/<slug>.json` and deletes the
draft file.

## `gbp-cache.json` (generated)

Cache of reviews + Q&A pulled from Google Business Profile by `/admin/gbp`.
The sitewide schema (`localBusinessWithRatingSchema`, `reviewListSchema`)
reads this file at build time, so refreshing the cache and redeploying
swaps the AggregateRating + Review markup across the whole site.

## Workflow

The admin pages write to this directory. To persist changes across
deployments:

1. Run the admin actions locally (`npm run dev` + the `/admin` panel).
2. `git add data/ src/content/resources/generated/`.
3. Push. Vercel rebuilds and picks up the new data.
