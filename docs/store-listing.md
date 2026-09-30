# Chrome Web Store listing

Everything to paste into the Chrome Web Store developer dashboard. Keep this file in sync with what is published.

## Store listing tab

**Name:** Clipper for Tolaria

**Summary** (max 132 characters, 105 used):

> Clip a web page or your selection into your Tolaria vault as a clean Markdown note. Unofficial companion.

**Category:** Productivity → Tools

**Language:** English (default). The extension itself is available in English and French and follows the browser language; the French listing below is optional.

**Description:**

```
Clipper for Tolaria is an unofficial extension that saves a web page, or just the text you selected, as a Markdown note in your Tolaria vault. It is not affiliated with or endorsed by Tolaria.

Click the icon (or press Alt+Shift+T, or use the right-click menu) and a side panel opens with the page converted to clean Markdown. Adjust the title, type or content, then save: the note is written straight into your vault folder and lands in the Tolaria Inbox.

• Clean extraction: navigation, ads and clutter are removed (powered by the open-source Defuddle library)
• Clip only a selection: select text first and only that passage is saved
• Straight into your vault: no export or import step (Chrome, Edge, Brave, Arc)
• Edit before saving: title, type and content
• Duplicate warning: tells you if the page is already in your vault
• Tidy metadata: type, url without tracking parameters, author, published and clipped dates
• Copy or download the Markdown instead, if you prefer

Private by design: no account, no server, no analytics. Nothing leaves your browser, and the extension only reads a page when you ask it to.

Open source (MIT): https://github.com/benoiteveillard/clipper-for-tolaria
```

**Description (French, optional second language):**

```
Clipper for Tolaria est une extension non officielle qui enregistre une page web, ou seulement le texte que vous avez sélectionné, sous forme de note Markdown dans votre vault Tolaria. Elle n'est ni affiliée à Tolaria ni approuvée par Tolaria.

Cliquez sur l'icône (ou Alt+Maj+T, ou le menu contextuel) : un panneau latéral affiche la page convertie en Markdown propre. Ajustez le titre, le type ou le contenu, puis enregistrez : la note est écrite directement dans le dossier de votre vault et arrive dans l'Inbox de Tolaria.

• Extraction propre : navigation, publicités et éléments parasites sont retirés (avec la bibliothèque libre Defuddle)
• Clip d'une sélection : sélectionnez du texte et seul ce passage est enregistré
• Directement dans le vault, sans export ni import (Chrome, Edge, Brave, Arc)
• Modification avant enregistrement : titre, type et contenu
• Alerte de doublon si la page est déjà dans le vault
• Métadonnées propres : type, url sans paramètres de suivi, auteur, dates de publication et de capture
• Copie ou téléchargement du Markdown en alternative

Respect de la vie privée : pas de compte, pas de serveur, pas de statistiques. Rien ne quitte votre navigateur, et l'extension ne lit une page que lorsque vous le demandez.

Open source (MIT) : https://github.com/benoiteveillard/clipper-for-tolaria
```

**Icon:** `public/icon/128.png` (uploaded automatically from the ZIP).

**Screenshots** (1280×800 or 640×400, PNG or JPEG, at least 1, up to 5). Suggested:

1. Side panel open next to an article, with the extracted note (title, type, content) and the "Save to vault" button. Take the screenshots with Chrome in English.
2. A selection on a page with the right-click "Clip to Tolaria" menu.
3. The "Already clipped" duplicate warning.
4. The note open in Tolaria, in the Inbox, showing the properties.
5. The options page.

Use a public, neutral page (for example a Wikipedia article). Avoid showing private content or your vault's file names.

**Small promo tile** (440×280): optional.

## Privacy tab

**Single purpose:**

> Save the web page or text selection the user is viewing as a Markdown note in the user's Tolaria vault folder.

**Permission justifications:**

| Permission | Justification |
|---|---|
| `activeTab` | Grants temporary access to the current tab only when the user clicks the icon, uses the shortcut or the context menu, so the page can be read and converted. No permanent site access is requested. |
| `scripting` | Injects the extraction script into the current tab, only in response to that user action. |
| `storage` | Stores the user's settings (default type, subfolder, author format) and passes the extracted clip from the background script to the side panel. |
| `contextMenus` | Adds the "Clip to Tolaria" entry to the right-click menu. |
| `sidePanel` | Shows the panel where the user reviews and edits the note before saving. |

**Host permissions:** none.

**Remote code:** No. All code is bundled in the package.

**Data usage:** the extension collects none of the listed data types. Check none, then certify all three statements (no selling, no unrelated use, no creditworthiness use).

**Privacy policy URL:** <https://github.com/benoiteveillard/clipper-for-tolaria/blob/master/PRIVACY.md>

## Test instructions for reviewers

```
No account or login is needed.
1. Open any article, for example https://en.wikipedia.org/wiki/Markdown, and click the extension icon. The side panel opens with the page as Markdown.
2. Click "Save to vault" and choose any empty folder as the vault. Allow write access. A .md file is created in it.
3. Select some text on the page, then use the right-click menu "Clip to Tolaria": only the selection is clipped.
The interface follows the browser language (English or French).
```

## Publishing steps

1. Create a developer account at <https://chrome.google.com/webstore/devconsole> (one-time 5 USD registration fee; 2-step verification on the Google account is required).
2. Build the ZIP: `npm run zip` → `.output/clipper-for-tolaria-<version>-chrome.zip` (also attached to each GitHub release).
3. **New item** → upload the ZIP. Fill in the tabs above. Upload the screenshots.
4. Choose the distribution: public, or unlisted while testing.
5. Submit for review. A first review often takes a few days.
6. To update: bump the version in `package.json` (it must increase), update `CHANGELOG.md`, tag, build the ZIP and upload it as a new version.

## Things to check before submitting

- **Icon and name.** The name is "Clipper for Tolaria", with an "unofficial" notice in the description. The current icon is close to Tolaria's visual identity, which can be flagged as misleading. A distinct icon is safer, and avoids having to change it after a takedown.
