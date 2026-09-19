import { copy, reporters, type Language } from './i18n.js';
import { confidence, scoreEvidence } from './scoring.js';
export type Sighting = { location_id: number; reporter_user_id: number; created_at: string; expires_at: string; locations: { floor: number; room: number } };
export type Vote = { location_id: number; user_id: number; vote_type: string; created_at: string };
// Reserved room 0 represents the named office location, not a physical floor/room.
export function locationLabel(floor: number, room: number, lang: Language = 'en') {
  return room === 0 ? copy[lang].office : `📍 ${copy[lang].floor} ${floor} · ${copy[lang].room} ${room}`;
}
export function rankCards(sightings: Sighting[], votes: Vote[], now: number, ttl: number) {
  const groups = new Map<number, Sighting[]>();
  for (const s of sightings) {
    if (Date.parse(s.expires_at) <= now) continue;
    groups.set(s.location_id, [...(groups.get(s.location_id) ?? []), s]);
  }
  return [...groups.entries()].map(([id, rows]) => {
    const latest = Math.max(...rows.map(s => Date.parse(s.created_at)));
    const first = Math.min(...rows.map(s => Date.parse(s.created_at)));
    const reports = new Set(rows.map(s => s.reporter_user_id)).size;
    const freshVotes = votes.filter(v => v.location_id === id && Date.parse(v.created_at) >= Math.max(first, now - ttl));
    const confirms = freshVotes.filter(v => v.vote_type === 'confirm').length;
    const rejects = freshVotes.filter(v => v.vote_type === 'reject').length;
    const left = freshVotes.filter(v => v.vote_type === 'left').length;
    const minutesAgo = Math.max(0, Math.floor((now - latest) / 60000));
    const evidence = { reports, confirms, rejects: rejects + left, minutesAgo };
    return { id, ...rows[0].locations, reports, confirms, rejects, left, minutesAgo, latest,
      level: confidence(evidence), score: scoreEvidence(evidence) };
  }).sort((a,b) => b.score - a.score || b.latest - a.latest);
}
export function cardText(card: ReturnType<typeof rankCards>[number], lang: Language = 'en') {
  const trust = { LOW: copy[lang].low, MEDIUM: copy[lang].medium, HIGH: copy[lang].high }[card.level];
  return `${locationLabel(card.floor, card.room, lang)}\n${trust} · ${card.minutesAgo === 0 ? copy[lang].now : card.minutesAgo + copy[lang].ago}\n👀 ${reporters(card.reports, lang)} · ${copy[lang].votes}`;
}
