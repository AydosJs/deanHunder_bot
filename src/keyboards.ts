import { InlineKeyboard } from 'grammy';
import { floors, roomsForFloor } from './locations.js';
export function mainMenu() {
  return new InlineKeyboard()
    .add({ text: '🔎 Find dean', callback_data: 'latest', style: 'primary' })
    .add({ text: '📍 Report', callback_data: 'report', style: 'success' }).row()
    .text('☕ Coffee', 'donate').text('❔ Help', 'help');
}
export function floorMenu() {
  const kb = new InlineKeyboard();
  floors.forEach((floor, i) => { kb.text('Floor ' + floor, 'floor:' + floor); if (i % 2) kb.row(); });
  return kb.text('⌂ Menu', 'home');
}
export function roomMenu(floor: number) {
  const kb = new InlineKeyboard();
  roomsForFloor(floor).forEach((room, i) => { kb.text(String(room), `room:${floor}:${room}`); if ((i + 1) % 5 === 0) kb.row(); });
  return kb.row().text('‹ Floors', 'report').text('⌂ Menu', 'home');
}
export function evidenceMenu(id: string, confirms = 0, rejects = 0, left = 0) {
  return new InlineKeyboard()
    .add({ text: `✅ Here · ${confirms}`, callback_data: `vote:confirm:${id}`, style: 'success' })
    .add({ text: `❌ Nope · ${rejects}`, callback_data: `vote:reject:${id}`, style: 'danger' })
    .text(`🚶 Left · ${left}`, `vote:left:${id}`).row()
    .text('↻ Refresh', 'latest').text('📍 Report', 'report').row()
    .text('⌂ Menu', 'home');
}
