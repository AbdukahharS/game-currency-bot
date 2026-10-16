import { Bot } from 'grammy'
import { config } from './config'
import { registerMenu } from './handlers/menu'
import { registerStart } from './handlers/start'
import { langOf, texts } from './texts'

export function createBot(token: string): Bot {
	const bot = new Bot(token)

	// order matters: commands first, the free-text nudge last
	registerStart(bot)
	registerMenu(bot)
	bot.on('message:text', (ctx) =>
		ctx.reply(texts.fallback[langOf(ctx.from?.language_code)]),
	)

	bot.catch((err) => {
		console.error('[bot] handler error:', err.error)
	})
	return bot
}

/** Menu button opens the Mini App (the deployed storefront); register commands. */
export async function setupBot(bot: Bot): Promise<void> {
	try {
		await bot.api.setChatMenuButton({
			menu_button: {
				type: 'web_app',
				text: 'PayGames',
				web_app: { url: config.webAppUrl },
			},
		})
	} catch (e) {
		// cosmetic — e.g. Telegram requires HTTPS for the menu button, so a
		// plain-http dev WEBAPP_URL must not keep the bot (and its auth
		// exchange endpoint) from starting
		console.warn('[bot] setChatMenuButton failed (ignored):', e)
	}
	await bot.api.setMyCommands([
		{ command: 'start', description: 'Магазин / Do‘kon' },
		{ command: 'help', description: 'Как купить / Qanday xarid qilinadi' },
		{ command: 'support', description: 'Поддержка / Yordam' },
	])
}
