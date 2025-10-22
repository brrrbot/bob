import { Player, useQueue } from "discord-player";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { buttonCommand } from "../../interfaces/buttonInterface.js";

export class SkipButtonCommand implements buttonCommand {
    public readonly customId: string = "skip";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });

        const currentSong = queue.currentTrack;
        queue.node.skip();

        const embed = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setDescription(`Skipped **${currentSong?.cleanTitle || "Unknown Track"}**`)
        .setThumbnail(currentSong?.thumbnail);
        await interaction.followUp({ embeds: [embed], flags: "SuppressNotifications" });
    }
}