import { Client } from "discord.js";
import { Player, onBeforeCreateStream } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "discord-player-spotify";

import playerconfig from "../config/player.json" with { type: "json" };
import extractorconfig from "../config/extractor.json" with { type: "json" };

import dotenv from "dotenv";
dotenv.config();

/**
 * Initialize and return a new Discord Player instance.
 */
export function initPlayer(client: Client): Player {
    return new Player(client, {
        // skipFFmpeg: playerconfig?.skipFFmpeg,
        // ffmpegPath: playerconfig?.FFmpegPath,
    });
}

/**
 * Register all extractors and stream hooks for the player.
 */
export async function registerExtractors(player: Player) {
    // Handle pre-stream logic (e.g., Youtubei/Spotify direct streams)
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
    if (extractorconfig.Youtubei.enabled) {
        try {
            await player.extractors.register(
                YoutubeiExtractor,
                getYoutubeiOptions(extractorconfig.Youtubei)
            );
            console.log("Youtubei extractor registered.");
        } catch (error) {
            console.error("Failed to register Youtubei extractor:", error);
        }
    }

    // Register Spotify
    if (extractorconfig.Spotify.enabled) {
        try {
            await player.extractors.register(
                SpotifyExtractor,
                getSpotifyOptions(extractorconfig.Spotify)
            );
            console.log("Spotify extractor registered.");
        } catch (error) {
            console.error("Failed to register Spotify extractor:", error);
        }
    }
}

/**
 * Unregister all extractors and re-register them.
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
 * Build Youtubei extractor options from config.
 */
function getYoutubeiOptions(config: any) {
    return {
        streamOptions: {
            useClient: config.client,
        },
        useServerAbrStream: config.sabr,
        generateWithPoToken: config.potoken,
    };
}

/**
 * Build Spotify extractor options from config + env vars.
 */
function getSpotifyOptions(config: any) {
    if (!config.useAccount) return {};

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        console.warn("Spotify credentials not set in environment variables.");
        return {};
    }

    return {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    };
}