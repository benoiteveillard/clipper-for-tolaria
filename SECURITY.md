# Security policy

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private reporting instead: **Security → Report a vulnerability** on this repository.

Include what you found, how to reproduce it, and the browser and extension version. You will get an answer as soon as possible; this is a small project maintained in spare time.

## Scope

The extension runs entirely in your browser, makes no network requests of its own, and only reads a page when you click its icon, use the shortcut or the right-click menu. Reports about the following are especially welcome:

- a page being able to make the extension write outside the chosen vault folder, or read anything it should not;
- unsafe handling of page content when building the note (frontmatter, file names, links);
- permissions broader than needed.

## Supported versions

Only the latest version on `master` is supported.
