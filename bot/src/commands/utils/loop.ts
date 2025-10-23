import { useQueue, QueueRepeatMode, Player } from "discord-player";
import { ButtonInteraction } from "discord.js";
import type { buttonCommand } from "../../interfaces/buttonInterface.js";

/**
 * Toggle loop feature
 * @implements {buttonCommand}
 */
export class LoopButtonCommand implements buttonCommand {
    public readonly customId: string = "loop";
    
    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });

        queue.setRepeatMode(queue.repeatMode === QueueRepeatMode.QUEUE ? QueueRepeatMode.OFF : QueueRepeatMode.QUEUE);

        const content = `Loop has been ${queue.repeatMode === QueueRepeatMode.QUEUE ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content });
    }
}