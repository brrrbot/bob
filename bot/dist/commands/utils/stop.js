import { useQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";
export async function stop(interaction) {
    const queue = useQueue(interaction.guildId);
    if (!queue)
        return void interaction.followUp({ content: "There is no queue in this server" });
    queue.delete();
    const embed = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setDescription("Music player is stopped")
        .setFooter({ text: "why you bully me?🥺" });
    await interaction.followUp({ embeds: [embed] });
}
