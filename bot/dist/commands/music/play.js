import { search } from "./search.js";
import { buildEmbedForPlaylist, buildEmbedForSong } from "../build/embedBuilder.js";
/**
 * Handles playing a track or playlist based on a slash command interaction.
 * @param interaction
 * @param player
 * @param type
 */
export async function play(interaction, player, type) {
    const query = interaction.options.getString("query");
    if (!query)
        return void interaction.followUp({ content: "No query provided!" });
    const searchResult = await search(query, interaction, player, type);
    if (!searchResult || !searchResult.tracks.length)
        return void interaction.followUp({ content: "No results found!" });
    let queue = player.nodes.get(interaction.guild);
    if (!queue)
        queue = await player.nodes.create(interaction.guild, { metadata: interaction.channel });
    try {
        if (!queue.connection) {
            const member = interaction.member;
            await queue.connect(member.voice.channel);
        }
    }
    catch (error) {
        console.error("Failed to join voice channel:", error);
        void player.destroy();
        return void interaction.followUp({ content: "Could not join voice channel!" });
    }
    const isPlaylist = type.endsWith("-playlist");
    try {
        if (isPlaylist) {
            const playlist = searchResult.playlist;
            queue.addTrack(playlist);
            const embed = buildEmbedForPlaylist(playlist);
            await interaction.followUp({ embeds: [embed] });
        }
        else {
            const track = searchResult.tracks[0];
            queue.addTrack(track);
            const embed = buildEmbedForSong(track);
            await interaction.followUp({ embeds: [embed] });
        }
    }
    catch (error) {
        console.error("Failed to add track/playlist to queue:", error);
        return void interaction.followUp({ content: "An error occurred while adding the track or playlist!" });
    }
    if (!queue.isPlaying()) {
        await queue.node.play();
    }
}
