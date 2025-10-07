# ArchangelCS (Archangel CyberSecurity)

![Status](https://img.shields.io/badge/status-work%20in%20progress-yellow)

A global, personalized AI-driven cybersecurity monitoring system that continuously scans emerging cyber threats and delivers tailored security alerts to users based on their specific software and device interests

## Features

- 🤖 Natural language interaction via Telegram bot (supports any language)
- 📰 Automatic RSS feed monitoring (every 3 hours)
- 🧠 AI-powered news analysis using Claude (Anthropic)
- 🏷️ Smart tagging system for software/devices
- 🔔 Personalized security alerts based on user interests
- 🔒 Access control via JOIN_KEY
- 🌐 Multi-language support for alerts

## Quick Start

1. **Create .env file:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

2. **Start services:**
```bash
docker-compose up -d
```

3. **Check logs:**
```bash
docker-compose logs -f app
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | PostgreSQL database password |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `JOIN_KEY` | Secret key required to register with bot |
| `CLAUDE_API_KEY` | Anthropic Claude API key |

## Bot Commands (Natural Language)

The bot understands natural language in any language. Examples:

### Registration
```
/start YOUR_JOIN_KEY
```

### Managing Tags (Software/Devices)
```
Add chrome, firefox, linux to my list
Remove sudo
Show my tags
```

### Managing RSS Feeds
```
Add RSS feed https://example.com/feed.xml
```

### Show System Stats
```
Show stats
```

### Manual Update
```
Run update now
```

### Help
```
help
```

## How It Works

1. **Every 3 hours:**
   - Fetch RSS feeds
   - Analyze new articles with Claude
   - Extract tags and CVE codes
   - Group similar threats
   - Send alerts to users

2. **Watermark system:**
   - Track last sent news_id per user
   - No duplicate alerts

3. **AI Grouping:**
   - Similar threats merged into one alert
   - Localized to user's language
   - Multiple sources combined

## License

MIT

## ⚠️ Disclaimer

ArchangelCS is a monitoring tool. Always verify critical information through official channels. The AI analysis is not a substitute for professional legal or security advice.

**"ArchangelCS"** is used as a generic descriptive term for this open-source cybersecurity monitoring project. The name refers to the concept of protection and guardianship, not any specific commercial product or service.

If the project name "ArchangelCS" conflicts with any registered trademarks, please open an issue and we will rename it immediately.

