import { describe, expect, it } from 'vitest';
import { confidence, scoreEvidence } from '../src/scoring.js';

describe('evidence scoring', () => {
  it('ranks fresh, confirmed reports highly', () => {
    expect(scoreEvidence({ reports: 7, confirms: 5, rejects: 1, minutesAgo: 2 })).toBeGreaterThan(10);
    expect(confidence({ reports: 7, confirms: 5, rejects: 1, minutesAgo: 2 })).toBe('HIGH');
  });

  it('does not overstate weak evidence', () => {
    expect(confidence({ reports: 1, confirms: 0, rejects: 0, minutesAgo: 1 })).toBe('LOW');
  });
});
