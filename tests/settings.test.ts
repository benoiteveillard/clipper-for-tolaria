import { describe, expect, it } from 'vitest';
import { subfolderError } from '../lib/settings';

describe('subfolderError', () => {
  it.each(['', 'Clips', 'Clips/Web', ' Clips / Web ', 'Café/東京', 'a.b'])('accepts %j', (value) => {
    expect(subfolderError(value)).toBeUndefined();
  });

  it.each(['..', 'a/../b', './a', 'a:b', 'a\\b', 'a?', 'a|b', 'a"b', 'a<b>'])('rejects %j', (value) => {
    expect(subfolderError(value)).toBeTypeOf('string');
  });
});
