# Telegram bot (bun + grammY)

Interactive shell around the shop per the spec (TZ §1.2). The storefront is the
**Telegram Mini App** — the deployed frontend (`frontend/`) opened inside
Telegram's WebView. The bot does not duplicate the shop: it handles commands,
deep links and navigation into the Mini App.

## What the bot does

| Element | Behavior |
|---|---|
| Bot menu button | Opens the Mini App (`WEBAPP_URL`) |
| `/start` | Greeting + "Open shop" button (`web_app`) |
| `/start order_{id}` | Payment return deep link (TZ §7.2): button that opens the Mini App on the order page (`startapp=order_{id}`); the backend ids orders by UUID, numeric tails from old links still match |
| `/help` | How to buy (5 steps) |
| `/support` | Support link from `SUPPORT_URL` — the rewritten backend has no public config endpoint, so env is the only source |
| §10 notifications | **Not sent by the bot**: the backend sends them directly via the Bot API with the same token (`backend/app/services/notifications.py`) — users see them from the same bot |

The bot's message language (ru/uz) follows the Telegram client's interface
language; the storefront language is chosen inside the Mini App and stored by
the backend. The bot keeps no storage of its own.

## Running

```bash
cd telegram
bun install
cp .env.example ../../.env-telegram   # or export the variables another way
bun run dev                           # long polling
```

Required variables: `TELEGRAM_BOT_TOKEN`, `WEBAPP_URL` (or `PUBLIC_BASE_URL`).
Optional: `SUPPORT_URL` (link for the /support command), webhook variables.

Production — webhook:

```bash
WEBHOOK_URL=https://<domain>/bot/webhook WEBHOOK_SECRET=<random> bun run start
```

Important: one token = one consumer of updates. While the `docker compose`
service `bot` (Python) is running, the TS bot cannot poll. By default only
`bot-telegram` starts (see `docker-compose.yml`; the old service is behind the
`legacy` profile).

## Structure

```
src/
├── index.ts            # entry: long polling (dev) / webhook (prod)
├── bot.ts              # grammY instance, menu button, commands
├── config.ts           # env (secrets live only in the environment, TZ §11.1)
├── texts.ts            # ru/uz texts
└── handlers/
    ├── start.ts        # /start + order_{uuid} deep link
    └── menu.ts         # /help, /support (SUPPORT_URL)
```
