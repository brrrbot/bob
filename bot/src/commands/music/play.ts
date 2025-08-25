import { Player } from "discord-player";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { search } from "./search.js";
import { buildEmbed } from "../build/embedBuilder.js";

/**
 * Handles playing a track or playlist based on a slash command interaction.
 */
export async function play(interaction: ChatInputCommandInteraction, player: Player, type: string) {
    const query = interaction.options.getString("query");
    if (!query) return void interaction.followUp({ content: "No query provided!" });

    const searchResult = await search(query, interaction, player, type);
    if (!searchResult || !searchResult.tracks.length)
        return void interaction.followUp({ content: "No results found!" });

    let queue = player.nodes.get(interaction.guild!);
    if (!queue) {
        queue = await player.nodes.create(interaction.guild!, {
            metadata: interaction.channel,
        });
    }

    try {
        if (!queue.connection) {
            const member = interaction.member as GuildMember;
            await queue.connect(member.voice.channel!);
        }
    } catch (error) {
        console.error("Failed to join voice channel:", error);
        void player.destroy();
        return void interaction.followUp({ content: "Could not join voice channel!" });
    }

    try {
        let item;
        if (type.endsWith("-playlist")) {
            item = searchResult.playlist!;
            queue.addTrack(item); // still works because playlist holds tracks
        } else {
            item = searchResult.tracks[0];
            queue.addTrack(item);
        }

        const embed = buildEmbed(item);
        await interaction.followUp({ embeds: [embed] });
    } catch (error) {
        console.error("Failed to add track/playlist to queue:", error);
        return void interaction.followUp({
            content: "An error occurred while adding the track or playlist!",
        });
    }

    if (!queue.isPlaying()) {
        await queue.node.play();
    }
}
