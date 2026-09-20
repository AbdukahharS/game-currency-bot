/**
 * Auth exchange (Mini App initData → API token), TZ §3.1.
 *
 * The deployed API verifies `POST /auth/telegram` payloads with the Login
 * Widget scheme (hash = HMAC_SHA256(data_check_string, SHA256(bot_token))),
 * while the initData Telegram hands the Mini App is signed with the WebAppData
 * scheme — the API rejects it with 401. Only the bot holds the token, so it
 * bridges the two: it verifies the initData signature itself (proving the
 * caller really runs inside this bot's WebView) and re-issues the same
 * identity as a widget-signed payload the API accepts, then returns the
 * API's `{ success, message, data: TokenResponse }` envelope to the client.
 */
import { createHash, createHmac } from 'node:crypto'
import { config } from './config'

/** initData older than this is stale — reject (Telegram mints it on open). */
const MAX_AGE_SECONDS = 60 * 60

/** Fields allowed into the re-issued payload — everything else is dropped. */
interface SafeUser {
	id: number
	first_name?: string
	last_name?: string
	username?: string
	photo_url?: string
	language_code?: string
}

class AuthError extends Error {}

/** Widget scheme: hash over the check string keyed by SHA256(bot_token). */
const widgetSecret = (): Buffer =>
	createHash('sha256').update(config.botToken).digest()
/** Mini App scheme: hash keyed by HMAC("WebAppData", bot_token). */
const webAppSecret = (): Buffer =>
	createHmac('sha256', 'WebAppData').update(config.botToken).digest()

/** data_check_string: decoded `key=value` lines sorted by key, joined by \n. */
const checkString = (pairs: [string, string][]): string =>
	pairs
		.filter(([k]) => k !== 'hash' && k !== 'signature')
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.map(([k, v]) => `${k}=${v}`)
		.join('\n')

/** Verifies the Mini App signature + freshness; returns the user and auth_date. */
function verifyInitData(raw: string): { user: SafeUser; authDate: number } {
	const params = [...new URLSearchParams(raw)]
	const hash = params.find(([k]) => k === 'hash')?.[1]
	if (!hash) throw new AuthError('init_data has no hash')
	const expected = createHmac('sha256', webAppSecret())
		.update(checkString(params))
		.digest('hex')
	if (expected !== hash) throw new AuthError('init_data signature is invalid')

	const authDate = Number(params.find(([k]) => k === 'auth_date')?.[1] ?? 0)
	if (!Number.isFinite(authDate) || authDate <= 0)
		throw new AuthError('init_data has no auth_date')
	if (Date.now() / 1000 - authDate > MAX_AGE_SECONDS)
		throw new AuthError('init_data is stale')

	const rawUser = params.find(([k]) => k === 'user')?.[1]
	let user: SafeUser
	try {
		user = JSON.parse(rawUser ?? '') as SafeUser
	} catch {
		throw new AuthError('init_data has no user')
	}
	if (!user || typeof user.id !== 'number' || user.id <= 0)
		throw new AuthError('init_data has no user')
	return { user, authDate }
}

/** Re-issues the verified identity under the widget scheme the API accepts. */
function mintWidgetInitData(user: SafeUser, authDate: number): string {
	const safe: SafeUser = {
		id: user.id,
		first_name: user.first_name,
		last_name: user.last_name,
		username: user.username,
		photo_url: user.photo_url,
		language_code: user.language_code,
	}
	const pairs: [string, string][] = [
		['auth_date', String(authDate)],
		['user', JSON.stringify(safe)],
	]
	const hash = createHmac('sha256', widgetSecret())
		.update(checkString(pairs))
		.digest('hex')
	return new URLSearchParams([...pairs, ['hash', hash]]).toString()
}

const json = (body: unknown, status: number): Response =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'POST, OPTIONS',
			'access-control-allow-headers': 'content-type',
		},
	})

/** POST /auth/exchange — body `{ init_data, language }` → API TokenResponse. */
export async function handleExchange(req: Request): Promise<Response> {
	const body = (await req.json().catch(() => null)) as {
		init_data?: unknown
		language?: unknown
	} | null
	const initData = typeof body?.init_data === 'string' ? body.init_data : ''
	const language = body?.language === 'uz' ? 'uz' : 'ru'
	if (!initData)
		return json({ success: false, message: 'init_data is required' }, 400)
	try {
		const { user, authDate } = verifyInitData(initData)
		const apiRes = await fetch(`${config.apiBaseUrl}/auth/telegram`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				init_data: mintWidgetInitData(user, authDate),
				language,
			}),
		})
		const payload = await apiRes.json().catch(() => null)
		return json(
			payload ?? { success: false, message: 'Bad API response' },
			apiRes.status,
		)
	} catch (e) {
		if (e instanceof AuthError)
			return json({ success: false, message: e.message }, 401)
		console.error('[bot] exchange error:', e)
		return json({ success: false, message: 'Exchange failed' }, 502)
	}
}

/** CORS preflight for the exchange endpoint. */
export function handleExchangePreflight(): Response {
	return json(null, 204)
}
