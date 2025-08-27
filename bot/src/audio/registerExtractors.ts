import { Client } from "discord.js";
import { Player, onBeforeCreateStream } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "discord-player-spotify";

import configs from "../config/config.json" with { type: "json" };
import dotenv from "dotenv";
dotenv.config();

/**
 * Initialize a new Discord Player instance.
 * @param client - Discord Client
 * @returns player - Player with configs specified in /bot/src/config/player.json
 */
export function initPlayer(client: Client): Player {
    return new Player(client, {
        skipFFmpeg: configs?.discordPlayer.skipFFmpeg,
        ffmpegPath: configs.discordPlayer.ffmpegPath,
    });
}

/**
 * Register all extractors and stream hooks for the player.
 * @param player - Player instances to register extractor for
 * @requires extractorconfig - Configs for extractor specified in /bot/src/config/extractor.json
 */
export async function registerExtractors(player: Player) {
    onBeforeCreateStream(async (track: any, queryType, queue) => {
        try {
            if (
                track.extractor?.identifier === YoutubeiExtractor.identifier ||
                track.extractor?.identifier === SpotifyExtractor.identifier
            ) {
                return await track.extractor?.stream(track);
            }
            return undefined;
        } catch (error) {
            console.error("Stream creation error:", error);
            return undefined;
        }
    });

    // Register Youtubei
    if (configs.discordPlayer.extractors.Youtubei.enabled) {
        try {
            await player.extractors.register(
                YoutubeiExtractor,
                getYoutubeiOptions(configs)
            );
            console.log("Youtubei extractor registered.");
        } catch (error) {
            console.error("Failed to register Youtubei extractor:", error);
        }
    }

    // Register Spotify
    if (configs.discordPlayer.extractors.Spotify.enabled) {
        try {
            await player.extractors.register(
                SpotifyExtractor,
                getSpotifyOptions(configs)
            );
            console.log("Spotify extractor registered.");
        } catch (error) {
            console.error("Failed to register Spotify extractor:", error);
        }
    }
}

/**
 * Unregister all extractors and re-register them.
 * @summary Function to reload extractors
 */
export async function reload(player: Player) {
    try {
        await player.extractors.unregisterAll();
        console.log("Extractors unregistered.");
        await registerExtractors(player);
        console.log("Extractors reloaded.");
    } catch (error) {
        console.error("Failed to reload extractors:", error);
    }
}

/**
 * Get Youtubei Configuration
 */
function getYoutubeiOptions(config) {
    return {
        streamOptions: {
            useClient: config.discordPlayer.extractors.Youtubei.config.client,
            highWaterMark: config.discordPlayer.extractors.Youtubei.config.highWaterMark,
        },
        useServerAbrStream: config.discordPlayer.extractors.Youtubei.config.sabr,
        generateWithPoToken: config.discordPlayer.extractors.Youtubei.config.potokens,
    };
}

/**
 * Get Spotify Configuration
 */
function getSpotifyOptions(config) {
    if (!config.discordPlayer.extractors.Spotify.config.useAccount) return {};

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        console.warn("Spotify credentials not set in environment variables.");
        return {};
    }

    return {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    };
}