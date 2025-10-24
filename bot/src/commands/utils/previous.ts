import { Player, useQueue } from "discord-player";
import { ButtonInteraction } from "discord.js";
import type { buttonCommand } from "../../interfaces/buttonInterface.js";

/**
 * Plays the previous song
 * @implements {buttonCommand}
 */
export class PreviousButtonCommand implements buttonCommand {
    public readonly customId: string = "prev";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        if (!queue.history.previousTrack) return void await interaction.followUp({ content: "No song to return to.", flags: "Ephemeral" });

        await queue.history.previous(true);
    }
}