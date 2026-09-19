import { describe, it, expect } from 'vitest';
import { rankCards, cardText, type Sighting, type Vote } from '../src/cards.js';
import { evidenceMenu, roomMenu } from '../src/keyboards.js';
const now = Date.parse('2026-09-20T00:00:00Z');
const ttl = 600000;
const sighting: Sighting = { location_id:1, reporter_user_id:1, created_at:new Date(now-60000).toISOString(), expires_at:new Date(now+60000).toISOString(), locations:{floor:1,room:104} };
describe('live evidence cards', () => {
  it('shows the named office without an invented physical room', () => {
    const card = rankCards([{...sighting, locations:{floor:1,room:0}}],[],now,ttl)[0];
    expect(cardText(card)).toContain('At base · Dean’s office');
    expect(cardText(card)).not.toContain('Room 0');
    expect(evidenceMenu('1').inline_keyboard.flat().some(b=>'callback_data' in b && b.callback_data==='base')).toBe(true);
  });
  it('counts independent reporters instead of repeated submissions', () => {
    const cards=rankCards([sighting,sighting,{...sighting,reporter_user_id:2}],[],now,ttl);
    expect(cards[0].reports).toBe(2);
  });
  it('excludes expired sightings and votes predating the active sighting', () => {
    const votes: Vote[] = [{location_id:1,user_id:2,vote_type:'confirm',created_at:new Date(now-120000).toISOString()}];
    expect(rankCards([sighting],votes,now,ttl)[0].confirms).toBe(0);
    expect(rankCards([{...sighting,expires_at:new Date(now).toISOString()}],[],now,ttl)).toEqual([]);
  });
  it('shows fresh rejection evidence and correct singular wording', () => {
    const votes: Vote[] = [{location_id:1,user_id:2,vote_type:'left',created_at:new Date(now).toISOString()}];
    const card=rankCards([sighting],votes,now,ttl)[0];
    expect(card.left).toBe(1);
    expect(cardText(card)).toContain('1 reporter ·');
    expect(evidenceMenu('1',0,0,1).inline_keyboard[0]).toHaveLength(3);
  });
  it('offers the full configured room range with valid callback payloads', () => {
    const buttons=roomMenu(4).inline_keyboard.flat();
    expect(buttons.some(b=>b.text==='450')).toBe(true);
    expect(buttons.every(b=>!('callback_data' in b)||Buffer.byteLength(b.callback_data)<=64)).toBe(true);
  });
});
