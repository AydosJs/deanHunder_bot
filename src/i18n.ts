export type Language = 'en' | 'ru' | 'uz';
export function languageOf(value?: string | null): Language {
  const code = value?.toLowerCase().split('-')[0];
  return code === 'ru' || code === 'uz' ? code : 'en';
}
export const copy = {
  en: {
    welcome:'👀 Seen the deputy dean?', find:'🔎 Find deputy dean', report:'📍 Report', base:'🏠 At base',
    coffee:'☕ Coffee', help:'❔ Help', menu:'⌂ Menu', floors:'‹ Floors', floor:'Floor', room:'Room',
    here:'✅ Here', nope:'❌ Nope', left:'🚶 Left', refresh:'↻ Refresh',
    chooseFloor:'📍 Which floor?', chooseRoom:'Pick room', empty:'🤷 No fresh sightings. Seen them?',
    helpText:'📍 Floor → room. Done.\n✅ Vote only on what you saw.\n⏳ Reports expire and can be wrong.',
    donate:'☕ Coffee fund brewing…\nDonations aren’t enabled yet.',
    error:'⚠️ Couldn’t finish. Try again.', old:'That button is old. Try these 👇',
    reported:'✅ Reported', already:'✅ Already reported', saved:'✓ Your vote is saved',
    expired:'⌛ That sighting expired.', also:'⚠️ Also reported:', office:'🏠 At base · Deputy dean’s office',
    low:'🟠 Unconfirmed', medium:'🟡 Likely', high:'🟢 Well supported',
    now:'just now', ago:'m ago', votes:'votes below', languageSaved:'✅ English selected',
    saveError:'⚠️ Couldn’t save your language. Try again.'
  },
  ru: {
    welcome:'👀 Видели замдекана?', find:'🔎 Где замдекана?', report:'📍 Сообщить', base:'🏠 На базе',
    coffee:'☕ На кофе', help:'❔ Помощь', menu:'⌂ Меню', floors:'‹ Этажи', floor:'Этаж', room:'Кабинет',
    here:'✅ Здесь', nope:'❌ Нет', left:'🚶 Ушёл', refresh:'↻ Обновить',
    chooseFloor:'📍 Какой этаж?', chooseRoom:'Выберите кабинет', empty:'🤷 Свежих сообщений нет. Видели замдекана?',
    helpText:'📍 Этаж → кабинет. Готово.\n✅ Подтверждайте только то, что видели.\n⏳ Сообщения устаревают и могут быть ошибочными.',
    donate:'☕ Копим на кофе…\nПожертвования пока недоступны.',
    error:'⚠️ Не получилось. Попробуйте ещё раз.', old:'Эта кнопка устарела. Попробуйте эти 👇',
    reported:'✅ Сообщение принято', already:'✅ Вы уже сообщили', saved:'✓ Ваш голос сохранён',
    expired:'⌛ Это сообщение устарело.', also:'⚠️ Также сообщают:', office:'🏠 На базе · Кабинет замдекана',
    low:'🟠 Не подтверждено', medium:'🟡 Вероятно', high:'🟢 Есть подтверждения',
    now:'только что', ago:' мин назад', votes:'голоса ниже', languageSaved:'✅ Выбран русский',
    saveError:'⚠️ Не удалось сохранить язык. Попробуйте ещё раз.'
  },
  uz: {
    welcome:'👀 Zamdekanni ko‘rdingizmi?', find:'🔎 Zamdekan qayerda?', report:'📍 Xabar berish', base:'🏠 O‘z xonasida',
    coffee:'☕ Qahva uchun', help:'❔ Yordam', menu:'⌂ Menyu', floors:'‹ Qavatlar', floor:'Qavat', room:'Xona',
    here:'✅ Shu yerda', nope:'❌ Yo‘q', left:'🚶 Ketdi', refresh:'↻ Yangilash',
    chooseFloor:'📍 Qaysi qavat?', chooseRoom:'Xonani tanlang', empty:'🤷 Yangi xabar yo‘q. Zamdekanni ko‘rdingizmi?',
    helpText:'📍 Qavat → xona. Tayyor.\n✅ Faqat o‘zingiz ko‘rgan bo‘lsangiz tasdiqlang.\n⏳ Xabarlar eskiradi va xato bo‘lishi mumkin.',
    donate:'☕ Qahva uchun…\nXayriya hali yoqilmagan.',
    error:'⚠️ Amal bajarilmadi. Qayta urinib ko‘ring.', old:'Bu tugma eskirgan. Quyidagilardan foydalaning 👇',
    reported:'✅ Xabar yuborildi', already:'✅ Siz allaqachon xabar bergansiz', saved:'✓ Ovozingiz saqlandi',
    expired:'⌛ Bu xabar eskirgan.', also:'⚠️ Yana bir xabar:', office:'🏠 O‘z xonasida · Zamdekan xonasi',
    low:'🟠 Tasdiqlanmagan', medium:'🟡 Ehtimol', high:'🟢 Tasdiqlar bor',
    now:'hozirgina', ago:' daqiqa oldin', votes:'ovozlar quyida', languageSaved:'✅ O‘zbek tili tanlandi',
    saveError:'⚠️ Tilni saqlab bo‘lmadi. Qayta urinib ko‘ring.'
  }
} satisfies Record<Language, Record<string,string>>;
export function reporters(n: number, lang: Language) {
  if (lang === 'uz') return n + ' kishi';
  if (lang === 'ru') {
    const mod = n % 100;
    return n + ' ' + (mod >= 11 && mod <= 14 ? 'человек' : n % 10 >= 2 && n % 10 <= 4 ? 'человека' : 'человек');
  }
  return n + (n === 1 ? ' reporter' : ' reporters');
}
