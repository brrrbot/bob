import { useQueue, QueueRepeatMode } from "discord-player";
/**
 * Toggle loop feature
 * @implements {buttonCommand}
 */
export class LoopButtonCommand {
    customId = "loop";
    async execute(interaction, player) {
        if (!interaction.deferred && interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        queue.setRepeatMode(queue.repeatMode === QueueRepeatMode.QUEUE ? QueueRepeatMode.OFF : QueueRepeatMode.QUEUE);
        const content = `Loop has been ${queue.repeatMode === QueueRepeatMode.QUEUE ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content });
    }
}
