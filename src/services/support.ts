import { config } from '../config'

/**
 * Support link (TZ §3.7). Single source of truth is the admin setting
 * `support_link`, read through the public API config. The bot caches it for
 * 5 minutes and degrades gracefully: without an API it uses SUPPORT_URL or none.
 */

const PLACEHOLDER = 'https://t.me/'
const TTL_MS = 5 * 60_000

const cache: { url: string | null; at: number } = { url: null, at: 0 }

export async function getSupportLink(): Promise<string | null> {
	if (config.supportUrl) return config.supportUrl
	if (!config.apiBaseUrl) return null
	if (Date.now() - cache.at < TTL_MS) return cache.url
	try {
		const res = await fetch(`${config.apiBaseUrl}/api/config`)
		if (res.ok) {
			const data = (await res.json()) as { support_link?: string }
			cache.url =
				data.support_link && data.support_link !== PLACEHOLDER
					? data.support_link
					: null
		}
	} catch {
		/* keep the previous value */
	}
	cache.at = Date.now()
	return cache.url
}
