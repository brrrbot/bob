![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License](https://img.shields.io/github/license/brrrbot/bob)

A (badly made) Discord music bot powered by Discord Player with support for Youtube & Spotify

Requirements:
1. Node.js (preferably >=18)
2. npm
3. Discord bot token from Discord dev portal
4. API keys if applicable (Spotify keys from Spotify dev website)
5. ffmpeg and path to ffmpeg in system environment variables

How to use:
1. Get the code
2. run npm install
3. node ./bot/settings/registerCommands.js
4. npm run start

env configuration: (seperate values with commas)
- TOKEN=bot-token
- CLIENT_IDS=discord-bot-user-id
- GUILD_IDS=server-id
- SPOTIFY_CLIENT_ID=spotify-client-id
- SPOTIFY_CLIENT_SECRET=spotify-client-secret

Commands:
- /play: Paste in URL
- /search: Select source and input name of song (doesnt work for playlist)

Credits:
- [@iTsMaaT](https://github.com/iTsMaaT) for Spotify extractor and bot code inspiration
- [@retrouser955](https://github.com/retrouser955) for Youtubei extractor

Built with:
- [discord.js](https://github.com/discordjs/discord.js)
- [discord-player](https://github.com/Androz2091/discord-player)
