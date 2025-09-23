import { useQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";
export class SkipButtonCommand {
    constructor() {
        this.customId = "skip";
    }
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        const currentSong = queue.currentTrack;
        queue.node.skip();
        const embed = new EmbedBuilder()
            .setColor("#FFFFFF")
            .setDescription(`Skipped **${currentSong?.cleanTitle || "Unknown Track"}**`)
            .setThumbnail(currentSong?.thumbnail);
        await interaction.followUp({ embeds: [embed], flags: "SuppressNotifications" });
    }
}
