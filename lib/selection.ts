// Serialises the user's selection (possibly several ranges, as in Firefox) so Defuddle can convert it.
export function selectionHtml(ranges: Range[], doc: Document): string {
  const container = doc.createElement('div');
  for (const range of ranges) container.append(range.cloneContents());
  return container.innerHTML.trim();
}

// Wrapping in <article> keeps Defuddle from mistaking a short passage for page chrome.
export const selectionPage = (html: string) => `<!doctype html><html><body><article>${html}</article></body></html>`;
