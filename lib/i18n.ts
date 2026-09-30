// Strings live in public/_locales/<lang>/messages.json; the browser picks the language.
export function t(key: string, ...substitutions: string[]): string {
  if (typeof browser === 'undefined') return key;
  return browser.i18n.getMessage(key as Parameters<typeof browser.i18n.getMessage>[0], substitutions) || key;
}

// Static HTML carries English text as a fallback; elements marked data-i18n get the translation.
export function localizeDocument(root: Document = document): void {
  root.documentElement.lang = browser.i18n.getUILanguage();
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n]')) el.textContent = t(el.dataset.i18n!);
  for (const el of root.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]')) {
    el.placeholder = t(el.dataset.i18nPlaceholder!);
  }
}
