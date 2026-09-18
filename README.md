# Telegram-бот (bun + grammY)

Интерактивная оболочка магазина по ТЗ §1.2. Витриной служит **Telegram Mini App** —
развёрнутый фронтенд (`frontend/`), открываемый в WebView Telegram. Бот не дублирует
магазин: он отвечает за команды, deep links и навигацию в Mini App.

## Что делает бот

| Элемент | Поведение |
|---|---|
| Меню-кнопка бота | Открывает Mini App (`WEBAPP_URL`) |
| `/start` | Приветствие + кнопка «Открыть магазин» (`web_app`) |
| `/start order_{id}` | Deep link возврата с оплаты (ТЗ §7.2): кнопка, открывающая Mini App на странице заказа (`startapp=order_{id}`) |
| `/help` | Как купить (5 шагов) |
| `/support` | Ссылка поддержки из настроек админки (`/api/config → support_link`), кэш 5 минут |
| Уведомления §10 | **Не отправляет**: их шлёт бэкенд напрямую через Bot API тем же токеном (`backend/app/services/notifications.py`) — пользователь видит их от того же бота |

Язык сообщений бота (ru/uz) определяется по языку клиента Telegram; язык витрины
выбирается в Mini App и хранится у бэкенда. Своего хранилища у бота нет.

## Запуск

```bash
cd telegram
bun install
cp .env.example ../../.env-telegram   # или задать переменные иначе
bun run dev                           # long polling
```

Обязательные переменные: `TELEGRAM_BOT_TOKEN`, `WEBAPP_URL` (или `PUBLIC_BASE_URL`).
Опционально: `API_BASE_URL` (поддержка из админки), `SUPPORT_URL`, webhook-переменные.

Прод — вебхук:

```bash
WEBHOOK_URL=https://<домен>/bot/webhook WEBHOOK_SECRET=<random> bun run start
```

Важно: один токен = один получатель updates. Пока `docker compose` сервис `bot`
(Python) работает, локальный/TS-бот не сможет pollить. По умолчанию поднимается
только `bot-telegram` (см. `docker-compose.yml`, старый сервис — профиль `legacy`).

## Структура

```
src/
├── index.ts            # entry: long polling (dev) / webhook (prod)
├── bot.ts              # экземпляр grammY, меню-кнопка, команды
├── config.ts           # env (секреты — только окружение, ТЗ §11.1)
├── texts.ts            # тексты ru/uz
├── handlers/
│   ├── start.ts        # /start + deep link order_{id}
│   └── menu.ts         # /help, /support
└── services/
    └── support.ts      # ссылка поддержки из публичного конфига API
```
