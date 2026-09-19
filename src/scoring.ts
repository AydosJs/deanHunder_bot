export type Evidence = { reports: number; confirms: number; rejects: number; minutesAgo: number };

export function scoreEvidence(evidence: Evidence): number {
  return evidence.reports * 2 + evidence.confirms * 3 - evidence.rejects * 2 - Math.max(0, evidence.minutesAgo - 2);
}

export function confidence(evidence: Evidence): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (evidence.reports >= 4 && evidence.confirms > evidence.rejects && evidence.minutesAgo <= 5) return 'HIGH';
  if (evidence.reports >= 2 && evidence.confirms >= evidence.rejects && evidence.minutesAgo <= 10) return 'MEDIUM';
  return 'LOW';
}
