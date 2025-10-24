import { Player, useQueue } from "discord-player";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import type { buttonCommand } from "../../interfaces/buttonInterface.js";

/**
 * Stops player
 * @implements {buttonCommand}
 */
export class StopButtonCommand implements buttonCommand {
    public readonly customId: string = "stop";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });

        queue.delete();
        const embed = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setDescription("Music player is stopped.")
        .setFooter({ text: "why you bully me?🥺" });
        await interaction.followUp({ embeds: [embed], flags: "SuppressNotifications" });
    }
}