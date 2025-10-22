import { useQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";
export class StopButtonCommand {
    customId = "stop";
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        queue.delete();
        const embed = new EmbedBuilder()
            .setColor("#FFFFFF")
            .setDescription("Music player is stopped.")
            .setFooter({ text: "why you bully me?🥺" });
        await interaction.followUp({ embeds: [embed], flags: "SuppressNotifications" });
    }
}
