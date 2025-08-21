import { QueryType } from "discord-player";
/**
 * Searches for a track or playlist using the specified search engine.
 * @param query
 * @param interaction
 * @param player
 * @param searchEngine
 */
export async function search(query, interaction, player, searchEngine) {
    const queryMap = {
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
    }
    catch (error) {
        console.error(`[Search Error] Query: "${query}" | Engine: "${searchEngine}"`, error);
        return null;
    }
}
