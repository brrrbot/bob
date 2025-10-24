import { useQueue, QueueRepeatMode } from "discord-player";
/**
 * Toggle repeat song feature
 * @implements {buttonCommand}
 */
export class RepeatButtonCommand {
    customId = "repeat";
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        queue.setRepeatMode(queue.repeatMode === QueueRepeatMode.TRACK ? QueueRepeatMode.OFF : QueueRepeatMode.TRACK);
        const content = `Repeat song has been ${queue.repeatMode === QueueRepeatMode.TRACK ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content });
    }
}
