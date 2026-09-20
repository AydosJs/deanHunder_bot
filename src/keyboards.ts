import { copy, type Language } from './i18n.js';
import { InlineKeyboard } from 'grammy';
import { floors, roomsForFloor, roomLabel } from './locations.js';
export function mainMenu(lang: Language = 'en') {
  return new InlineKeyboard()
    .add({ text: copy[lang].find, callback_data: 'latest', style: 'primary' })
    .add({ text: copy[lang].report, callback_data: 'report', style: 'success' }).row()
    .add({ text: copy[lang].base, callback_data: 'base', style: 'success' }).row()
    .text(copy[lang].coffee, 'donate').text(copy[lang].help, 'help').row().text('🌐 Language / Язык / Til', 'language');
}
export function floorMenu(lang: Language = 'en') {
  const kb = new InlineKeyboard().add({ text: copy[lang].base, callback_data: 'base', style: 'success' }).row();
  floors.forEach((floor, i) => { kb.text(copy[lang].floor + ' ' + floor, 'floor:' + floor); if (i % 2) kb.row(); });
  return kb.text(copy[lang].menu, 'home');
}
export function roomMenu(floor: number, lang: Language = 'en') {
  const kb = new InlineKeyboard();
  roomsForFloor(floor).forEach((room, i) => { kb.text(roomLabel(floor, room), `room:${floor}:${room}`); if ((i + 1) % 2 === 0) kb.row(); });
  return kb.row().text(copy[lang].floors, 'report').text(copy[lang].menu, 'home');
}
export function evidenceMenu(id: string, confirms = 0, rejects = 0, left = 0, lang: Language = 'en') {
  return new InlineKeyboard()
    .add({ text: `${copy[lang].here} · ${confirms}`, callback_data: `vote:confirm:${id}`, style: 'success' })
    .add({ text: `${copy[lang].nope} · ${rejects}`, callback_data: `vote:reject:${id}`, style: 'danger' })
    .text(`${copy[lang].left} · ${left}`, `vote:left:${id}`).row()
    .text(copy[lang].refresh, 'latest').text(copy[lang].report, 'report').row()
    .text(copy[lang].base, 'base').text(copy[lang].menu, 'home');
}

export function languageMenu() {
  return new InlineKeyboard().text('🇬🇧 English', 'lang:en').row().text('🇷🇺 Русский', 'lang:ru').row().text('🇺🇿 O‘zbekcha', 'lang:uz');
}
