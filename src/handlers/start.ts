import { type Bot, InlineKeyboard } from 'grammy'
import { config } from '../config'
import { langOf, orderRedirectText, texts } from '../texts'

/** payload grammar: TZ §7.2 return_url — t.me/<bot>?start=order_{order_id} */
const ORDER_PAYLOAD = /^order[_-]?(\d+)$/i

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
			return ctx.reply(orderRedirectText(lang, id), {
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
