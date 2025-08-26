import { QueryType } from "discord-player";
import { buildEmbed } from "../build/embedBuilder.js";
/**
 * Searches for song/playlist given (preferably URL) and add to queue
 * @param player - Player instances
 * @param interaction - Slash command interaction
 */
export async function play(player, interaction) {
    const query = interaction.options.getString("query");
    if (!query)
        return void interaction.followUp({ content: "No query provided" });
    const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
    });
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
        console.error("Error joining voice channel: ", error);
        void player.destroy();
        return void interaction.followUp({ content: "Could not join voice channel" });
    }
    try {
        let item;
        searchResult.playlist ? item = searchResult.playlist.tracks : item = searchResult.tracks[0];
        queue.addTrack(item);
        const embed = buildEmbed(searchResult.playlist ?? item);
        await interaction.followUp({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error adding song/playlist to queue: ", error);
        return void interaction.followUp({ content: "Could not add track/playlist" });
    }
    if (!queue.isPlaying())
        await queue.node.play();
}
