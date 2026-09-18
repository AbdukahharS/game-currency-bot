import { webhookCallback } from 'grammy'
import { createBot, setupBot } from './bot'
import { config } from './config'

const bot = createBot(config.botToken)
await setupBot(bot)

if (config.webhookUrl) {
	// production: Telegram pushes updates to WEBHOOK_URL (HTTPS, TZ §11.1)
	await bot.api.setWebhook(config.webhookUrl, {
		secret_token: config.webhookSecret,
		drop_pending_updates: true,
	})
	const handleUpdate = webhookCallback(bot, 'bun', {
		secretToken: config.webhookSecret,
	})
	const server = Bun.serve({
		port: config.port,
		fetch: async (req) => {
			const { pathname } = new URL(req.url)
			if (pathname === '/health') return new Response('ok')
			if (req.method !== 'POST') return new Response(null, { status: 405 })
			return handleUpdate(req)
		},
	})
	console.log(
		`[bot] webhook mode: ${config.webhookUrl} (listening on :${server.port})`,
	)
} else {
	// dev: long polling
	await bot.init
	bot.start({
		onStart: (me) => {
			console.log(
				`[bot] @${me.username} long polling — Mini App: ${config.webAppUrl}`,
			)
		},
	})
}
