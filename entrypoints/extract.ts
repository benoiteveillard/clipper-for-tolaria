import Defuddle from 'defuddle/full';
import { iframesToLinks, toExtractedPage } from '@/lib/extract';
import { selectionHtml, selectionPage } from '@/lib/selection';

// Injected on demand via scripting.executeScript; main()'s return value is the injection result.
export default defineUnlistedScript(() => {
  const url = location.href;
  // Read the selection before Defuddle touches anything.
  const selected = selectionHtml(selectedRanges(), document);
  const page = toExtractedPage(new Defuddle(document, { markdown: true, url }).parse(), url);
  if (!selected) return page;

  const doc = new DOMParser().parseFromString(selectionPage(selected), 'text/html');
  const markdown = iframesToLinks(new Defuddle(doc, { markdown: true, url }).parse().content ?? '').trim();
  // The page's lead image describes the article, not the passage.
  return markdown ? { ...page, markdown, image: undefined, selection: true } : page;
});

function selectedRanges(): Range[] {
  const selection = getSelection();
  if (!selection || selection.isCollapsed || !selection.toString().trim()) return [];
  return Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i));
}
