# Privacy policy

_Clipper for Tolaria, last updated 2026-09-30._

**Clipper for Tolaria does not collect, transmit or share any data.** It has no server, no account, no analytics and no tracking. The extension makes no network requests of its own.

## What the extension reads

When you click its icon, use the keyboard shortcut or the right-click menu, the extension reads the page in the current tab (or only your selection, if you selected text) to convert it to Markdown. It does this only at that moment, and only on that tab. It has no permanent access to any website.

## What it stores, and where

Everything stays on your device, in your browser:

| Data | Where | Why |
|---|---|---|
| Your settings (type, subfolder, author format) | Browser extension storage (`storage.local`) | To remember your preferences |
| The clip being reviewed | Browser session storage (`storage.session`) | To pass it from the background script to the side panel. It is cleared when you close the window or the browser |
| A handle to your vault folder | Browser storage (IndexedDB) | So you do not have to pick the folder each time. It only grants access to the folder you chose |

## What it writes

When you click **Save**, the note is written as a Markdown file in the folder you chose. The **Copy** button puts the note on your clipboard, and **Download** saves the file through your browser. These only happen when you click.

## Third parties

None. The extension does not contact any service. Images in a clip stay as links to the original site: they load from that site when you view the note in another app, not through this extension.

## Permissions

| Permission | Used for |
|---|---|
| `activeTab`, `scripting` | Reading the current page when you ask for a clip |
| `storage` | The settings and the temporary clip above |
| `contextMenus` | The right-click "Clip to Tolaria" entry |
| `sidePanel` | The side panel where you review the note |

## Changes and contact

If this policy changes, the change appears in this file's history on GitHub. For questions, open an issue at <https://github.com/benoiteveillard/clipper-for-tolaria/issues>.

This is an independent project, not affiliated with Tolaria.
