import { Client, ClientOptions } from "discord.js";
import { Player, onBeforeCreateStream } from "discord-player";
import { SpotifyExtractor } from "discord-player-spotify";
// import { YoutubeiExtractor, YoutubeiOptions } from "discord-player-youtubei";
import { YoutubeSabrExtractor } from "../youtubeExtractor/youtubeExtractor.js";
import { RadikoExtractor } from "discord-player-radiko-v2";
import { Log } from "youtubei.js";

import AppConfig from "../config/config.json" with { type: "json" };

import { ClientActivityHandler } from "./activity.js";
import { InteractionHandler } from "../controller/interaction.js"
import { PlayerEventHandler } from "../error/errorEventHandler.js"
import { MusicEventHandler } from "../controller/musicEvent.js"

type ExtractorsConfig = typeof AppConfig.discordPlayer.extractors;

export class PlayerClient extends Client {
    public player: Player;
    public interactionHandler: InteractionHandler;
    public playerEventHandler: PlayerEventHandler;
    public musicEventHandler: MusicEventHandler;
    public activityHandler: ClientActivityHandler;

    constructor(options: ClientOptions) {
        super(options);

        // @ts-expect-error
        this.player = new Player(this, {
            skipFFmpeg: AppConfig.discordPlayer.skipFFmpeg,
            ffmpegPath: AppConfig.discordPlayer.ffmpegPath,
        });

        this.setupPlayerHooks();

        this.registerPlayerExtractors();

        this.interactionHandler = new InteractionHandler(this, this.player);
        this.playerEventHandler = new PlayerEventHandler(this.player);
        this.musicEventHandler = new MusicEventHandler(this.player);
        this.activityHandler = new ClientActivityHandler(this);

        this.registerAllEventHandlers();

        Log.setLevel(Log.Level.NONE);
    }

    private setupPlayerHooks() {
        onBeforeCreateStream(async (track: any, queryType, queue) => {
            try {
                if (
                    track.extractor?.identifier === YoutubeSabrExtractor.identifier ||
                    track.extractor?.identifier === SpotifyExtractor.identifier ||
                    track.extractor?.identifier === RadikoExtractor.identifier
                ) {
                    return await track.extractor?.stream(track);
                }
                return undefined;
            } catch (error) {
                console.error("Stream creation error:", error);
                return undefined;
            }
        });
    }

    private async registerPlayerExtractors() {
        const extractorsConfig = AppConfig.discordPlayer.extractors;

        if (extractorsConfig.Youtubei.enabled) {
            try {
                await this.player.extractors.register(
                    YoutubeSabrExtractor,
                    {}, // this.getYoutubeiOptions(extractorsConfig.Youtubei) as YoutubeiOptions,
                );
                console.log("Youtubei extractor registered.");
            } catch (error) {
                console.error("Failed to register Youtubei extractor:", error);
            }
        }

        if (extractorsConfig.Spotify.enabled) {
            try {
                await this.player.extractors.register(
                    SpotifyExtractor,
                    this.getSpotifyOptions(extractorsConfig.Spotify)
                );
                console.log("Spotify extractor registered.");
            } catch (error) {
                console.error("Failed to register Spotify extractor:", error);
            }
        }

        if (extractorsConfig.Radiko.enabled) {
            try {
                await this.player.extractors.register(RadikoExtractor, {});
                console.log("Radiko extractor registered.");
            } catch (error) {
                console.error("Failed to register Radiko extractor:", error);
            }
        }
    }

    private getYoutubeiOptions(youtubeiConfig: ExtractorsConfig['Youtubei']) {
        return {
            streamOptions: {
                useClient: youtubeiConfig.config.client,
                highWaterMark: youtubeiConfig.config.highWaterMark,
            },
            useServerAbrStream: youtubeiConfig.config.sabr,
            generateWithPoToken: youtubeiConfig.config.potokens,
        };
    }

    private getSpotifyOptions(spotifyConfig: ExtractorsConfig['Spotify']) {
        if (!spotifyConfig.config.useAccount) return {};

        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            console.warn("Spotify credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET) are not set in .env. Spotify extractor might not function correctly.");
            return {};
        }

        return {
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        };
    }

    private registerAllEventHandlers() {
        this.interactionHandler.register();
        this.playerEventHandler.register();
        this.musicEventHandler.register();
        this.activityHandler.register();
    }

    public async start(token: string) {
        await this.login(token);
    }
}