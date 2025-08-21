import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { buttonCommand } from "../commands.js";
import { useQueue } from "discord-player";

export class skip implements buttonCommand {
    name = "skip";

    async execute(interaction: ButtonInteraction): Promise<void> {
        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
        const currentSong = queue.currentTrack;
        queue.node.skip();
        const embed = new EmbedBuilder()
            .setColor("#FFFFFF")
            .setDescription(`Skipped **${currentSong?.title || "Unknown Track"}**`)
            .setThumbnail(currentSong?.thumbnail!);
        await interaction.followUp({ embeds: [embed] });
    }
}