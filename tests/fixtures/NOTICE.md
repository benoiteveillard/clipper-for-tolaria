# Test fixtures

The files in `html/` are inputs for the snapshot tests. They are **not** covered by this project's MIT license.

## Saved pages

Each of these is a saved copy of a public page, kept under the license of its source. The generated notes in `../__snapshots__/` are derived from them and carry the same terms.

| Fixture | Source | License |
|---|---|---|
| `wikipedia-en-markdown.html` | <https://en.wikipedia.org/wiki/Markdown> | CC BY-SA 4.0, authors listed in the page history |
| `wikipedia-fr-markdown.html` | <https://fr.wikipedia.org/wiki/Markdown> | CC BY-SA 4.0, authors listed in the page history |
| `docs-mdn-file-system-api.html` | <https://developer.mozilla.org/en-US/docs/Web/API/File_System_API> | CC BY-SA 2.5 or later (code samples: CC0), by MDN contributors |
| `docs-react-thinking.html` | <https://react.dev/learn/thinking-in-react> | CC BY 4.0, by Meta Platforms, Inc. and affiliates |
| `github-defuddle-readme.html` | <https://github.com/kepano/defuddle> | MIT, by Steph Ango |
| `arxiv-attention.html` | <https://arxiv.org/abs/1706.03762> | arXiv metadata, including abstracts, is CC0 |

If you are a rights holder and want one of these removed, open an issue.

## Synthetic pages

`synthetic-*.html` were written for this project to reproduce the structure of real pages (press article, blog post, social post) without copying anyone's content. They are covered by the MIT license.

## Adding a fixture

Only add pages you are allowed to redistribute, and list them in the table above with their license. Otherwise write a small synthetic page instead.
