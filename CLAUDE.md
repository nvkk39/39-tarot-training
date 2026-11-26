# Tarot Training — development guide

Offline-first tarot reading trainer PWA, hosted on GitHub Pages at
https://<your-username>.github.io/<repo-name>/ (branch `main`; replace with your own account and repo name).

## Core principles
1. **Zero-build static architecture.** Vanilla HTML5, CSS3 and ES6+ JavaScript only. No npm, bundlers, frameworks or CDN links. Every script, style, font and asset lives in the repo.
2. **Relative paths only.** The site is served under `/tarot-trainer-pwa/`, so never use a leading `/` in asset, manifest or Service Worker URLs.
3. **Offline cache discipline.** When you add, rename or change files, update the `ASSETS` list in `sw.js` and bump `CACHE_NAME`.
4. **Zero-backend data.** Static reference data lives in `data/`; card images in `img/cards/<card id>.webp` (list them in `sw.js`). User progress lives in `localStorage` and can be exported/imported as JSON.
5. **Modular design.** Keep rendering (`app.js`), datasets (`data/`) and coaching logic (`engine.js`) separate. `CoachEngine.evaluateReading()` is the only interface the UI uses, so a client-side AI model can replace it later.

## Workflow
- Before changing more than 2–3 files or adding a feature direction, outline a short plan and confirm trade-offs.
- Provide complete files rather than partial snippets.
- Mobile-first: thumb-friendly layouts and graceful offline fallbacks.

## Layout
See the project structure in README.md.

## Languages
- The app is Japanese by default with English as an option; the choice is saved in `localStorage` (`arcana.lang.v1`).
- All interface text lives in `i18n.js`. Card text is in `data/cards.js` (English) and `data/cards.ja.js` (Japanese). Spread and prompt text is in `data/spreads.js`. Coach messages are in `engine.js`.
- When you add or change a card, spread, prompt or UI string, update **both** languages. Never hard-code visible text in `app.js`; use `I18n.t('key')`.
- Adding another language means adding it in `i18n.js`, `data/spreads.js` and `engine.js`, plus a card data file like `cards.ja.js`, and listing any new files in `sw.js`.

## GitHub basics (for newcomers)
High-level notes only; details may change, so check GitHub's own docs when in doubt.

- **Repo:** public, MIT-licensed (see `LICENSE`). Anything committed is visible to everyone, so never commit secrets or personal data.
- **Deploying:** there is no build. GitHub Pages is set to deploy through GitHub Actions (Settings → Pages → Source). The workflow in `.github/workflows/static.yml` publishes the whole repo on every push to `main`. A deploy takes about a minute; if the site looks stale, check the Actions tab for a failed run.
- **Running locally:** serve the repo folder with any static server (for example `python3 -m http.server`) and open `localhost` in a browser. Opening `index.html` directly will not register the Service Worker.
- **Updates reach users slowly on purpose.** The Service Worker is cache-first, so after a deploy an installed app may need to be closed and reopened once or twice before it shows the new version. Always bump `CACHE_NAME` in `sw.js` so the update is picked up.
- **Pushing:** use small commits with clear messages. If a push is rejected, pull first, because `main` changed elsewhere (for example an edit made on github.com). For larger changes, use a branch and a pull request.
- **File names are case-sensitive on GitHub Pages**, even if your computer ignores case. Keep names lowercase and match them exactly in code and in `sw.js`.
- **Content and art:** card text and artwork in this repo are original. Do not paste in text or images from published tarot guidebooks or commercial decks.
- **User data stays on the device** (`localStorage`). Changing the saved-data shape can break people's existing progress and backups, so keep old data readable or add a small migration.
