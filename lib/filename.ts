const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;
const MAX_LENGTH = 80;

// Mirrors Tolaria's noteSlug: keeps Unicode letters/digits, everything else collapses to '-'.
export function slugify(title: string): string {
  const slug = Array.from(
    title
      .normalize('NFC')
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, ''),
  )
    .slice(0, MAX_LENGTH)
    .join('')
    .replace(/-+$/, '');
  return RESERVED.test(slug) ? `${slug}-note` : slug;
}

export function noteFilename(title: string, now = new Date()): string {
  return `${slugify(title) || `untitled-clip-${now.getTime()}`}.md`;
}

export async function uniqueFilename(
  filename: string,
  exists: (name: string) => Promise<boolean>,
): Promise<string> {
  const stem = filename.replace(/\.md$/, '');
  for (let n = 1; ; n++) {
    const name = n === 1 ? `${stem}.md` : `${stem}-${n}.md`;
    if (!(await exists(name))) return name;
  }
}
