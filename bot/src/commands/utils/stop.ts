import { useQueue } from "discord-player";
import { ButtonInteraction, EmbedBuilder } from "discord.js";

export async function stop(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId);
    if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
    queue.delete();
    const embed = new EmbedBuilder()
        .setColor(0x1db954)
        .setDescription("Music player is stopped")
        .setFooter({ text: "why you bully me?🥺" });
    await interaction.followUp({ embeds: [embed] });
}