import { useQueue, QueueRepeatMode, Player } from "discord-player";
import { ButtonInteraction } from "discord.js";
import type { buttonCommand } from "../../interfaces/buttonInterface.js";

/**
 * Toggle repeat song feature
 * @implements {buttonCommand}
 */
export class RepeatButtonCommand implements buttonCommand {
    public readonly customId: string = "repeat";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral"});

        queue.setRepeatMode(queue.repeatMode === QueueRepeatMode.TRACK ? QueueRepeatMode.OFF : QueueRepeatMode.TRACK);

        const content = `Repeat song has been ${queue.repeatMode === QueueRepeatMode.TRACK ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content });
    }
}