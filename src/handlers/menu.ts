import { type Bot, InlineKeyboard } from 'grammy'
import { getSupportLink } from '../services/support'
import { langOf, texts } from '../texts'

export function registerMenu(bot: Bot) {
	bot.command('help', async (ctx) => {
		const lang = langOf(ctx.from?.language_code)
		return ctx.reply(texts.help[lang], {
			parse_mode: 'HTML',
			link_preview_options: { is_disabled: true },
		})
	})

	bot.command('support', async (ctx) => {
		const lang = langOf(ctx.from?.language_code)
		const link = await getSupportLink()
		if (!link) return ctx.reply(texts.supportMissing[lang])
		return ctx.reply(texts.supportAsk[lang], {
			reply_markup: new InlineKeyboard().url(texts.supportButton[lang], link),
		})
	})
}
