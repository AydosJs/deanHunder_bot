import { InlineKeyboard } from 'grammy';
import { floors, roomsForFloor } from './locations.js';

export function mainMenu() {
  return new InlineKeyboard()
    .text('📍 Report sighting', 'report').row()
    .text('🔎 Where is the dean?', 'latest').row()
    .text('☕ Buy me a coffee', 'donate').row()
    .text('ℹ️ How it works', 'help');
}

export function floorMenu() {
  const keyboard = new InlineKeyboard();
  floors.forEach((floor) => keyboard.text(`${floor}️⃣ Floor ${floor}`, `floor:${floor}`).row());
  return keyboard.text('⬅️ Back', 'home');
}

export function roomMenu(floor: number) {
  const keyboard = new InlineKeyboard();
  roomsForFloor(floor).forEach((room, index) => {
    keyboard.text(String(room), `room:${floor}:${room}`);
    if ((index + 1) % 5 === 0) keyboard.row();
  });
  return keyboard.row().text('⬅️ Back', 'report');
}

export function evidenceMenu(locationId: string) {
  return new InlineKeyboard()
    .text('✅ I saw them here', `vote:confirm:${locationId}`).row()
    .text('❌ Not here', `vote:reject:${locationId}`).row()
    .text('🚶 They left', `vote:left:${locationId}`).row()
    .text('🔄 Refresh', 'latest');
}
