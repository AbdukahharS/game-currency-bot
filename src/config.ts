/** Env config, TZ §11.1: secrets only from the environment, never in code. */

const optional = (name: string): string | undefined => {
	const v = process.env[name]?.trim()
	return v || undefined
}

const required = (name: string): string => {
	const v = optional(name)
	if (!v) throw new Error(`Missing required env var: ${name}`)
	return v
}

const trimSlash = (url: string) => url.replace(/\/+$/, '')

export const config = {
	get botToken(): string {
		return required('TELEGRAM_BOT_TOKEN')
	},
	/** Mini App URL — the deployed frontend. Falls back to the site origin. */
	get webAppUrl(): string {
		const url = optional('WEBAPP_URL') ?? optional('PUBLIC_BASE_URL')
		if (!url)
			throw new Error('Set WEBAPP_URL (Mini App URL) or PUBLIC_BASE_URL')
		return trimSlash(url)
	},
	/** Backend origin — used only to read the public config (support link). */
	get apiBaseUrl(): string | undefined {
		const v = optional('API_BASE_URL')
		return v ? trimSlash(v) : undefined
	},
	get supportUrl(): string | undefined {
		return optional('SUPPORT_URL')
	},
	/** HTTPS webhook endpoint; when unset the bot runs long polling (dev). */
	get webhookUrl(): string | undefined {
		const v = optional('WEBHOOK_URL')
		return v ? trimSlash(v) : undefined
	},
	get webhookSecret(): string | undefined {
		return optional('WEBHOOK_SECRET')
	},
	get port(): number {
		return Number.parseInt(process.env.PORT ?? '3000', 10) || 3000
	},
}
