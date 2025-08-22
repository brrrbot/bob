import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
dotenv.config()

// List of commands
const commands = [
    // Play Youtube Song
    {
        name: "yt",
        description: "Play Youtube Song",
        options: [{
            name: "query",
            type: 3,
            description: "song name",
            required: true,
        }],
    },
    // Play Spotify Song
    {
        name: "sf",
        description: "Play Spotify Song",
        options: [{
            name: "query",
            type: 3,
            description: "song name",
            required: true,
        }],
    },
    // Play Youtube Playlist
    {
        name: "ytp",
        description: "Play Youtube Playlist",
        options: [{
            name: "query",
            type: 3,
            description: "playlist url",
            required: true,
        }],
    },
    // Play Spotify Playlist
    {
        name: "sfp",
        description: "Play Spotify Playlist",
        options: [{
            name: "query",
            type: 3,
            description: "playlist url",
            required: true,
        }],
    },
]

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