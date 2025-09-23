import { useQueue, QueueRepeatMode } from "discord-player";
export class LoopButtonCommand {
    constructor() {
        this.customId = "loop";
    }
    async execute(interaction, player) {
        if (!interaction.deferred && interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        if (queue.repeatMode === QueueRepeatMode.QUEUE) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
        }
        else {
            queue.setRepeatMode(QueueRepeatMode.QUEUE);
        }
        const content = queue.repeatMode === QueueRepeatMode.QUEUE ? "Loop has been enabled." : "Loop has been disabled.";
        await interaction.followUp({ content: content });
    }
}
