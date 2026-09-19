import { type Bot, InlineKeyboard } from 'grammy'
import { config } from '../config'
import { langOf, texts } from '../texts'

/** OrderRead.id grammar — the backend ids orders by UUID. */
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

/**
 * payload grammar: TZ §7.2 return_url — t.me/<bot>?start=order_{order_id},
 * where order_id is a UUID; a numeric tail still matches legacy links.
 */
const ORDER_PAYLOAD = new RegExp(`^order[_-]?(${UUID}|\\d+)$`, 'i')

/**
 * The t.me link is the only way to open the Mini App with a start_param,
 * so "open the order page" is a URL button, not a web_app button.
 */
export const miniAppLink = (username: string, startapp: string) =>
	`https://t.me/${username}?startapp=${encodeURIComponent(startapp)}`

export const shopKeyboard = () =>
	new InlineKeyboard().webApp(texts.shopButton.ru, config.webAppUrl)

export function registerStart(bot: Bot) {
	bot.command('start', async (ctx) => {
		const lang = langOf(ctx.from?.language_code)
		const payload = ctx.match?.trim() ?? ''
		const orderMatch = ORDER_PAYLOAD.exec(payload)
		if (orderMatch?.[1]) {
			const id = orderMatch[1]
			return ctx.reply(texts.orderRedirect[lang], {
				reply_markup: new InlineKeyboard().url(
					texts.openOrderButton[lang],
					miniAppLink(ctx.me.username, `order_${id}`),
				),
				parse_mode: 'HTML',
			})
		}
		return ctx.reply(texts.greeting[lang], {
			reply_markup: new InlineKeyboard().webApp(
				texts.shopButton[lang],
				config.webAppUrl,
			),
			parse_mode: 'HTML',
		})
	})
}
