# Contributing to Clipper for Tolaria

Thanks for wanting to help. This is a small project, so the process is light.

## Ground rules

- By contributing you agree that your work is released under the project's [MIT license](LICENSE).
- **Privacy first.** The extension makes no network requests and asks for as few permissions as possible. A change that adds either needs a strong reason, stated in the pull request.
- **Never mark a clip as organized.** Notes must not get `_organized`, so they stay in the Tolaria Inbox.
- **Keep the frontmatter minimal.** Tolaria edits frontmatter line by line, so values stay on one line and only add a property when it is clearly useful.

## Getting set up

You need Node.js 22 or later.

```bash
npm install
npm run dev          # Chrome with hot reload, in a separate profile
```

Load the extension, click its icon on any page, and the side panel opens. You can develop and test without Tolaria itself: notes are plain Markdown files, so any folder works as a vault.

## Before you open a pull request

```bash
npm run compile      # type-check
npm test             # unit and snapshot tests (about 40 seconds)
npm run build        # and `npm run build:firefox` if you touched browser APIs
```

CI runs the same commands.

## Code style

- TypeScript, strict. Match the surrounding code: naming, comment density and idioms.
- Comments say **why**, not what.
- Keep logic that can be tested in `lib/` (no DOM or extension APIs when it can be avoided), and keep `entrypoints/` thin.
- User-facing text lives in `public/_locales/<lang>/messages.json` (English is the default, French is included). Never hard-code a visible string: add a key to every language and use `t('key')` in code or `data-i18n="key"` in HTML. `tests/i18n.test.ts` checks that languages stay in sync and that no key is missing or unused.
- To add a language, copy `public/_locales/en` to `public/_locales/<code>` (for example `de`), translate the `message` values, and keep the `$PLACEHOLDERS$` as they are. Add the language to the README if you like. Chrome picks the language from the browser's own language, so there is no setting for it.

## Tests

- New behavior comes with a test. Bug fixes come with a test that fails without the fix.
- `lib/vault.ts` is tested against a small in-memory fake of a directory handle (see `tests/vault.test.ts`); reuse that pattern.

### Snapshot tests

`tests/extract.snapshot.test.ts` runs the extraction on saved pages in `tests/fixtures/html` and compares the resulting note with `tests/__snapshots__/`.

- If extraction changes, update snapshots with `npx vitest run -u`, then **read the diff**. It is the actual effect of your change. Explain notable changes in the pull request.
- To add a page, add it to `tests/fixtures/pages.json` and run `npm run fixtures -- <name>` (needs Google Chrome). Only add pages you are allowed to redistribute (content under a permissive or Creative Commons license) and list them with their license in `tests/fixtures/NOTICE.md`. For anything else, write a small synthetic page (see the `synthetic-*` fixtures and mark it `"synthetic": true` in `pages.json`). Prefer small pages. News articles, blog posts and social posts are almost never redistributable.
- The tests use `jsdom` pinned to 30.0.1: newer 30.1.x versions make Defuddle extract menus instead of the article in the tests. If you investigate that, a fix is very welcome.

## Pull requests

- Keep them focused: one fix or feature each.
- Describe what changed and why, and how you checked it (a screenshot helps for panel changes).
- Commit messages: a short imperative summary line, then details if needed.
- The extension is not tested automatically in a real browser yet. Say which browser you tried it in.

## Reporting bugs

Open an issue with: the page URL (if it is public), what you expected, what you got, your browser and version, and the extension version. For an extraction problem, the URL is usually enough for us to reproduce it.

## Security

Please do not open a public issue for a security problem. Use GitHub's private vulnerability reporting (**Security → Report a vulnerability**) on this repository.
