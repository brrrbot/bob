import { Player, QueueRepeatMode, useQueue } from "discord-player";
import { ButtonInteraction } from "discord.js";
import type { buttonCommand } from "../../interfaces/buttonInterface.js";

/**
 * Toggle autoplay feature
 * @implements {buttonCommand}
 */
export class AutoplayButtonCommand implements buttonCommand {
    public readonly customId: string = "autoplay";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        
        // queue.setRepeatMode(queue.repeatMode === QueueRepeatMode.AUTOPLAY ? QueueRepeatMode.OFF : QueueRepeatMode.AUTOPLAY);

        // const content = `Autoplay has been ${queue.repeatMode === QueueRepeatMode.AUTOPLAY ? "enabled" : "disabled"}`; 
        // await interaction.followUp({ content: content });
        await interaction.followUp({ content: "Autoplay does not work right now." });
    }
}