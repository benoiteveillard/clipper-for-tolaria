# Spike : écrire dans un vault Tolaria depuis l'extension

Date : 2026-09-10. Tolaria 2026.9.8 (macOS), Chrome 152.

## Résultats

| Question | Résultat | Preuve |
|---|---|---|
| Tolaria détecte-t-il une note écrite par un process externe, sans relance ? | **Oui, en ~0,8 s.** | Écriture `x.md.crswap` puis `rename` → `x.md` (même forme de syscalls que `createWritable()`), l'entrée apparaît dans le cache `~/.laputa/cache/<hash>.json` après 763 ms. Watcher natif `notify` (ADR-0089/0165) + `refreshPulledVaultState()` (ADR-0135). |
| La note arrive-t-elle dans l'Inbox ? | **Oui**, tant qu'elle n'a pas `_organized: true`. | `VaultEntry.organized` ← `_organized` (`src/utils/systemMetadata.ts`). Le clipper n'écrit jamais ce champ. |
| Le bridge WS accepte-t-il une origine `chrome-extension://` ? | **Non : 403 sur 9710 et 9711.** | `spike/bridge-probe.mjs` : `Unexpected server response: 403`. Code : `evaluateBridgeRequest()` rejette toute `Origin` sur le tool bridge, et n'accepte que `tauri://…` / `http://localhost:*` sur le UI bridge. |
| Un client **sans** origine peut-il créer une note ? | **Oui.** | `create_note` → note créée **et** ouverte dans un onglet Tolaria (`vault_changed` + `open_tab`). Protocole `{id, tool, args}` → `{id, result \| error}`. Le bridge ne tourne que si l'app est ouverte avec un vault actif. |
| Deep link pour ouvrir la note ? | **Oui, navigation seule.** | `tolaria://<vault-slug>/<chemin.md>` (ADR-0129). Ne crée rien. |
| FS Access : que devient la permission après redémarrage du navigateur ? | **Elle persiste.** | Constaté à l'usage sur ~3 semaines (2026-09-30) : après fermeture de Chrome et extinction de l'ordinateur, le vault reste accessible sans nouvelle invite. |

## Protocole manuel FS Access (page `spike.html`)

1. `npm run dev`, puis ouvrir `chrome-extension://<id>/spike.html` (l'id est dans `chrome://extensions`).
2. **Choisir le vault** → **Écrire spike-\*.md**. Vérifier que la note apparaît dans l'Inbox Tolaria.
3. Quitter Chrome (Cmd+Q), relancer, rouvrir `spike.html`. Le journal (persisté en `localStorage`) indique `load: … permission=<état>`.
4. Cliquer **Écrire** : noter si Chrome affiche une invite, et si elle propose « Autoriser à chaque visite ».
5. Refaire 2 à 4 depuis le side panel (bouton **Enregistrer dans le vault**).
6. **Tester ws://localhost:9710 et 9711** : attendu `error` sur les deux.

Résultat (usage réel, Chrome sur macOS) : état après redémarrage = `granted`, invite affichée = non, persistance possible = oui. Le protocole n'a pas été rejoué formellement. `ensurePermission` reste en place pour le cas où Chrome oublierait l'accès.

## Décision

- **Principal : File System Access** (Chrome, Edge, Brave, Arc), depuis le side panel. Le clic sur « Enregistrer » fournit le geste utilisateur pour `requestPermission()` si Chrome a oublié la permission.
- **Secours : Copier le Markdown / Télécharger le .md.** Firefox et Safari n'ont pas `showDirectoryPicker`, et c'est aussi le recours si la permission est refusée.
- **Écarté pour l'instant : native messaging host** (la persistance rend la gestion de permission sans objet) → `create_note` sur `ws://localhost:9710`. Supprime la gestion de permission et ouvre la note dans Tolaria, mais demande un installeur (manifest NativeMessagingHosts + binaire Node) et Tolaria doit être ouvert.

## Nettoyage

Les deux notes créées pendant le spike (`spike-bridge-*.md`, `spike-watcher-*.md`) ont été supprimées du vault. Elles n'avaient pas été commitées par AutoGit.
