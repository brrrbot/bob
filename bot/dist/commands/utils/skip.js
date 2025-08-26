import { useQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";
export async function skip(interaction) {
    const queue = useQueue(interaction.guildId);
    if (!queue)
        return void interaction.followUp({ content: "There is no queue in this server" });
    const currentSong = queue.currentTrack;
    queue.node.skip();
    const embed = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setDescription(`Skipped **${currentSong?.title || "Unknown Track"}**`)
        .setThumbnail(currentSong?.thumbnail);
    await interaction.followUp({ embeds: [embed] });
}
