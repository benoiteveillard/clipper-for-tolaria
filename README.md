# Clipper for Tolaria

A browser extension that clips a web page (or just your selection) into the **Inbox** of a [Tolaria](https://github.com/refactoringhq/tolaria) vault, as a Markdown note.

> **Unofficial.** This project is independent and is not affiliated with, endorsed by, or maintained by the Tolaria team. "Tolaria" is used only to say what the extension works with.

## Features

- **Clean extraction.** [Defuddle](https://github.com/kepano/defuddle) strips navigation, ads and other page chrome and converts the article to Markdown.
- **Clip a selection.** Select text first and only that passage is clipped, with its formatting and absolute links.
- **Straight into your vault.** The note is written directly to your vault folder using the File System Access API. Tolaria picks it up on its own, and it lands in the Inbox.
- **Edit before saving.** A side panel shows the title, type and Markdown so you can adjust them first.
- **Duplicate warning.** If a note with the same `url` already exists in the target folder, the panel tells you and links to it.
- **Three ways to start a clip:** the toolbar icon, the shortcut `Alt+Shift+T` (change it at `chrome://extensions/shortcuts`), or the right-click menu.
- **Fallback.** Copy the Markdown or download the `.md` file (this is all that is available on browsers without the File System Access API, such as Firefox).

## What a note looks like

```markdown
---
type: Clip
url: https://example.com/post
author: Jane Doe
published: 2026-09-10
clipped: 2026-09-30
---

# Post title

Body of the article, as Markdown.
```

- `published` only appears when the site provides a date. It is never guessed.
- `clipped` is always the day you clipped the page.
- Tracking parameters (`utm_*`, `fbclid`, …) are removed from `url`.
- The extension never writes `_organized`, so the note stays in the Tolaria Inbox until you organize it.

## Install

There is no store listing yet, so build it from source. You need Node.js 22 or later.

```bash
git clone https://github.com/benoiteveillard/clipper-for-tolaria.git
cd clipper-for-tolaria
npm install
npm run build
```

Then, in Chrome, Edge, Brave or Arc:

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `.output/chrome-mv3`.

For Firefox, `npm run build:firefox` produces `.output/firefox-mv2`. Firefox support is experimental: there is no File System Access API there, so you can only copy or download the note.

## Usage

1. Click the extension icon on the page you want to keep (select some text first to clip only that).
2. The side panel opens with the extracted note. Edit the title, type or content if needed.
3. Click **Save to vault**. The first time, choose your vault folder and allow write access.
4. Use **Open in Tolaria** to jump to the note.

### Settings

Open the extension's options page:

| Setting | Default | What it does |
|---|---|---|
| Default type | `Clip` | Value of the `type` property |
| Subfolder | vault root | Where notes are written. Tolaria organizes by type, not by folder, so the root is recommended |
| Author as wikilink | off | Writes `author: "[[jane-doe]]"` instead of plain text |

## Privacy and permissions

The extension makes no network requests of its own, has no analytics, and sends nothing anywhere. Everything happens in your browser.

| Permission | Why |
|---|---|
| `activeTab`, `scripting` | Read the page you clicked on, only at that moment. There is no permanent access to any site |
| `storage` | Keep your settings, and hand the extracted clip from the background script to the side panel |
| `contextMenus` | The right-click entry |
| `sidePanel` (Chrome) | The panel where you review the note |

See the full [privacy policy](PRIVACY.md). The vault folder handle is stored in your browser (IndexedDB) so you don't have to pick it again. Images in a clip stay as links to the original site; they are not downloaded.

## Development

```bash
npm run dev            # Chrome, with hot reload (uses a separate browser profile)
npm run dev:firefox
npm run compile        # type-check
npm test               # unit tests + snapshot tests on saved real pages
npm run build          # production build (Chrome)
```

The interface is in English and French, and follows the language of your browser. New translations are welcome (see [CONTRIBUTING.md](CONTRIBUTING.md)).

### Layout

- `entrypoints/`: background script, the injected extraction script, the side panel and the options page
- `lib/`: extraction mapping, note building, file names, vault access, duplicate detection (the parts covered by tests)
- `tests/`: unit tests, and snapshot tests that run the extraction on saved pages
- `docs/spike-results.md`: notes on how writing to a Tolaria vault was validated

### Snapshot tests

`tests/__snapshots__/*.md` hold the exact notes the clipper would produce for each saved page. After any change to extraction, review the snapshot diff carefully: that diff is the real result of your change. `npm run fixtures` captures the rendered DOM of pages that are missing from `tests/fixtures/html`. Fixtures are either pages under an open license or small synthetic pages (see the notice in `tests/fixtures`).

## Contributing

Bug reports, ideas and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

[MIT](LICENSE). The test fixtures in `tests/fixtures/` are the exception: see [`tests/fixtures/NOTICE.md`](tests/fixtures/NOTICE.md).

This project is not affiliated with Tolaria, which has its own license.
