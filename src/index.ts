import { webhookCallback } from 'grammy'
import { handleExchange, handleExchangePreflight } from './auth'
import { createBot, setupBot } from './bot'
import { config } from './config'

const bot = createBot(config.botToken)
await setupBot(bot)

// Mini App silent login (TZ §3.1) needs the bot's /auth/exchange endpoint, so
// the HTTP server runs in both modes — long polling (dev) and webhook (prod).
const webhookUrl = config.webhookUrl
let handleUpdate: ((req: Request) => Response | Promise<Response>) | undefined

if (webhookUrl) {
	// production: Telegram pushes updates to WEBHOOK_URL (HTTPS, TZ §11.1)
	await bot.api.setWebhook(webhookUrl, {
		secret_token: config.webhookSecret,
		drop_pending_updates: true,
	})
	handleUpdate = webhookCallback(bot, 'bun', {
		secretToken: config.webhookSecret,
	})
} else {
	// dev: long polling (the HTTP server below stays up for the Mini App)
	await bot.init
}

const server = Bun.serve({
	port: config.port,
	fetch: async (req) => {
		const { pathname } = new URL(req.url)
		if (pathname === '/health') return new Response('ok')
		if (pathname === '/auth/exchange') {
			if (req.method === 'OPTIONS') return handleExchangePreflight()
			if (req.method !== 'POST') return new Response(null, { status: 405 })
			return handleExchange(req)
		}
		if (handleUpdate && req.method === 'POST') return handleUpdate(req)
		return new Response(null, { status: 404 })
	},
})

if (webhookUrl) {
	console.log(
		`[bot] webhook mode: ${webhookUrl} (listening on :${server.port})`,
	)
} else {
	bot.start({
		onStart: (me) => {
			console.log(
				`[bot] @${me.username} long polling — Mini App: ${config.webAppUrl} — auth exchange on :${server.port}`,
			)
		},
	})
}
