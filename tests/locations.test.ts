import { describe, expect, it } from 'vitest';
import { floors, roomsForFloor, roomLabel, roomLabelsByFloor } from '../src/locations.js';
import { roomMenu } from '../src/keyboards.js';
import { locationLabel } from '../src/cards.js';
describe('Building 1 rooms', () => {
  it('groups all 70 unique rooms under the correct floor', () => {
    const all = floors.flatMap(floor => {
      const rooms = roomsForFloor(floor);
      expect(rooms.length).toBeGreaterThan(0);
      expect(rooms.every(room=>Math.floor(room/100)===floor)).toBe(true);
      expect(roomLabelsByFloor[floor].every(label=>label.startsWith('1/'))).toBe(true);
      return rooms;
    });
    expect(all).toHaveLength(70);
    expect(new Set(all).size).toBe(70);
    expect(roomsForFloor(0)).toEqual([]);
    expect(roomsForFloor(5)).toEqual([]);
  });
  it('preserves supplied room suffixes and base translations', () => {
    expect(roomLabel(3,335)).toBe('1/335L');
    expect(roomLabel(2,236)).toBe('1/236L');
    expect(roomLabel(1,132)).toBe('1/132(Ural)');
    expect(roomLabel(3,338)).toBe('1/338(M)');
    expect(locationLabel(3,335,'uz')).toContain('1/335L');
    expect(locationLabel(1,0)).toContain('At base');
  });
  it('round-trips button IDs to database room numbers on each floor', () => {
    for (const floor of floors) {
      const buttons = roomMenu(floor).inline_keyboard.flat().filter(b=>'callback_data' in b && b.callback_data.startsWith('room:'));
      expect(buttons).toHaveLength(roomsForFloor(floor).length);
      for (const button of buttons) {
        if (!('callback_data' in button)) throw new Error('Missing callback');
        const [,f,r] = button.callback_data.split(':').map(Number);
        expect(f).toBe(floor);
        expect(roomsForFloor(f).includes(r)).toBe(true);
        expect(roomLabel(f,r)).toBe(button.text);
        expect(Buffer.byteLength(button.callback_data)).toBeLessThanOrEqual(64);
      }
    }
  });
});
