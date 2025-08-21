import { Player, QueryType, SearchResult } from "discord-player";
import { Interaction } from "discord.js";

/**
 * Searches for a track or playlist using the specified search engine.
 * @param query
 * @param interaction
 * @param player
 * @param searchEngine
 */
export async function search(
    query: string,
    interaction: Interaction,
    player: Player,
    searchEngine: string
): Promise<SearchResult | null> {
    const queryMap: Record<string, QueryType> = {
        "spotify-playlist": QueryType.SPOTIFY_PLAYLIST,
        "youtube-playlist": QueryType.YOUTUBE_PLAYLIST,
        "spotify": QueryType.SPOTIFY_SONG,
        "youtube": QueryType.YOUTUBE,
    };
    const queryType = queryMap[searchEngine] || QueryType.AUTO;
    try {
        const result = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: queryType,
        });
        return result;
    } catch (error) {
        console.error(`[Search Error] Query: "${query}" | Engine: "${searchEngine}"`, error);
        return null;
    }
}