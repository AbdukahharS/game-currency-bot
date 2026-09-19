/**
 * Bot texts, ru/uz (TZ §1.3). The bot has no per-user storage, so it picks the
 * language from the Telegram client's reported interface language; the real
 * storefront language is chosen inside the Mini App (frontend → /users/me).
 */

export type Lang = 'ru' | 'uz'

export const langOf = (code?: string | null): Lang =>
	code?.toLowerCase().startsWith('uz') ? 'uz' : 'ru'

type Copy = Record<Lang, string>

export const texts = {
	greeting: {
		ru: [
			'🎮 <b>GameCoin</b>',
			'',
			'Игровая валюта PUBG Mobile и пополнение Steam.',
			'Оплата в сумах: Uzcard, Humo, Visa, Mastercard.',
			'',
			'Жми «Открыть магазин» — каталог, корзина и история заказов внутри.',
		].join('\n'),
		uz: [
			'🎮 <b>GameCoin</b>',
			'',
			'PUBG Mobile o‘yin valyutasi va Steam hisobini to‘ldirish.',
			'To‘lov so‘mda: Uzcard, Humo, Visa, Mastercard.',
			'',
			'«Do‘konni ochish» tugmasini bosing — katalog, savat va buyurtmalar tarixi ichida.',
		].join('\n'),
	} satisfies Copy,

	shopButton: {
		ru: '🛒 Открыть магазин',
		uz: '🛒 Do‘konni ochish',
	} satisfies Copy,

	orderRedirect: {
		ru: [
			'🧾 Заказ',
			'',
			'Открой его в магазине: актуальный статус, коды ваучеров и ссылка на оплату — внутри.',
		].join('\n'),
		uz: [
			'🧾 Buyurtma',
			'',
			'Do‘konda oching: holati, vaucher kodlari va to‘lov havolasi ichida.',
		].join('\n'),
	} satisfies Copy,

	openOrderButton: {
		ru: 'Открыть заказ',
		uz: 'Buyurtmani ochish',
	} satisfies Copy,

	help: {
		ru: [
			'ℹ️ <b>Как купить</b>',
			'',
			'1. Открой магазин — кнопка меню или /start',
			'2. Выбери игру и номинал',
			'3. Проверь корзину и нажми «Оплатить»',
			'4. Оплати картой по платёжной ссылке',
			'5. Код ваучера или статус пополнения придёт сюда и останется в разделе «Заказы»',
			'',
			'Поддержка: /support',
		].join('\n'),
		uz: [
			'ℹ️ <b>Qanday xarid qilinadi</b>',
			'',
			"1. Do'konni oching — menyu tugmasi yoki /start",
			"2. O'yin va nominalni tanlang",
			'3. Savatni tekshirib «To‘lash»ni bosing',
			"4. To‘lov havolasi orqali karta bilan to'lang",
			'5. Vaucher kodi yoki to‘ldirish holati shu yerga keladi va «Buyurtmalar»da qoladi',
			'',
			'Yordam: /support',
		].join('\n'),
	} satisfies Copy,

	supportAsk: {
		ru: 'Нужна помощь? Напиши нам — разберёмся.',
		uz: 'Yordam kerakmi? Bizga yozing — hal qilamiz.',
	} satisfies Copy,

	supportButton: { ru: '💬 Поддержка', uz: '💬 Yordam' } satisfies Copy,

	supportMissing: {
		ru: 'Канал поддержки ещё подключается. Пока пиши через кнопку поддержки в магазине.',
		uz: 'Yordam kanali hozir ulanmoqda. Hozircha do‘kondagi yordam tugmasidan yozing.',
	} satisfies Copy,

	fallback: {
		ru: 'Не понял 🤔 Команды: /start — магазин, /help — как купить, /support — поддержка.',
		uz: "Tushunmadim 🤔 Buyruqlar: /start — do'kon, /help — qanday xarid qilinadi, /support — yordam.",
	} satisfies Copy,
}
