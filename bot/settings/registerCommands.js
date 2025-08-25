import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
dotenv.config()

// List of commands
const commands = [
    {
        name: "play",
        description: "Plays a given song/playlist from URL",
        options: [{
            name: "query",
            type: 3,
            description: "Song/Playlist URL (name might not work)",
            required: true,
        }],
    },
    {
        name: "search",
        description: "Search songs/playlists by name",
        options:[
            {
                name: "source",
                type: 3,
                description: "Music Source",
                required: true,
                choices: [
                    { name: "Youtube", value: "youtube" },
                    { name: "Spotify", value: "spotify" },
                ],
            },
            {
                name: "query",
                type: 3,
                description: "Song Name",
                required: true,
            },
        ],
    },
    {
        name: "ui",
        description: "UI interface for music player (experimental)",
    },
];

// Read data from environment file
const tokens = process.env.TOKENS?.split(',') || [];
const clientIds = process.env.CLIENT_IDS?.split(',') || [];
const guildIds = process.env.GUILD_IDS?.split(',') || [];

// Validate env data and register commands
(async () => {
    if (tokens.length !== clientIds.length) {
        console.log("TOKENS and CLIENT_IDS do not match.");
        return;
    }

    for (let i = 0; i < tokens.length; i++) {
        const rest = new REST({ version: 10 }).setToken(tokens[i]);
        const clientId = clientIds[i];

        for (const guildId of guildIds) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(clientId,guildId),{ body: commands }
                );
                console.log(`Registered commands for bot ${clientId} in guild ${guildId}`);
            } catch (error) {
                console.error(`Failed to register commands for bot ${clientId} in guild ${guildId}`);
            }
        }
    }
})();