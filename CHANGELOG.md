# Changelog

## 0.1.0

First public release.

- Clip a web page, or only your selection, as a Markdown note in the Inbox of a Tolaria vault. Extraction uses [Defuddle](https://github.com/kepano/defuddle).
- Frontmatter: `type`, `url` (tracking parameters removed), `author`, `published` (only when the site provides it) and `clipped`.
- Side panel to review and edit the title, type and content before saving.
- Start a clip from the toolbar icon, the shortcut `Alt+Shift+T`, or the right-click menu.
- Warns when a note with the same `url` already exists in the target folder.
- One clip per browser window; unsaved edits are kept when a new clip arrives.
- Copy or download the Markdown as a fallback (the only option on Firefox, which has no File System Access API).
- Options: default type, subfolder, author as wikilink.
