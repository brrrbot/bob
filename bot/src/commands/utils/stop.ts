import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { buttonCommand } from "../commands.js";
import { useQueue } from "discord-player";

export class stop implements buttonCommand {
    name = "stop";

    async execute(interaction: ButtonInteraction): Promise<void> {
        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
        queue.delete();
        const embed = new EmbedBuilder()
            .setColor(0x1db954) // Spotify green
            .setDescription("Music player is stopped")
            .setFooter({ text: "why you bully me?🥺" });
        await interaction.followUp({ embeds: [embed] });
    }
}