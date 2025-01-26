# About

Telegram bot for uploading videos from YouTube to telegram based on telegram app api.

Bot support huge files (above 50mb for manual telegram bots api). Size limit is about 2GB.

## Installation

### Clone repo

```bash
git clone https://github.com/1ovve1/nodejs-ytdl-telegram-bot.git
cd nodejs-ytdl-telegram-bot
```

### Push your app data into .env file

```bash
cp .env.example .env
nano .env
```

**read more about telegram apps [here](https://core.telegram.org/api/obtaining_api_id)*

### Cookies

You should find some cookies from your YouTube session for better experience. Thats help to resolve many errors and improve download speed. Just use Cookie Editor extension for your browser. Im using [this](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm).

```bash
nano cookies.json
```

### Installation and migrations

```bash
npm install && npm prepare_cli && node migrator up
```

### Build and run

```bash 
npm run build && npm run serve
```

## Benefits and Troubles

Benefits:
+ huge file size limits that allow you to download videos less than 2GB;
+ Supports queue and restoring;
+ Video time marks detection;
+ Audio and video options.

Troubles:
+ ytdl works slow, sometimes its broke for now reason. but it's all about YouTube harmfulness, Thanks [distudejs](https://github.com/distubejs/ytdl-core) for your fork of dead ytdl-core library;
+ Cannot download some videos with 18+ marks (cookies wasn't help in that case);
+ DO NOT USE IT IN GROUPS OR CHANNELS (i do not test it in any cases).