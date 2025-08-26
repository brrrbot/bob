import { useQueue, QueueRepeatMode } from "discord-player";
export async function loop(interaction) {
    const queue = useQueue(interaction.guildId);
    if (!queue)
        return void interaction.followUp({ content: "There is no queue in this server" });
    if (queue.repeatMode === QueueRepeatMode.QUEUE) {
        queue.setRepeatMode(QueueRepeatMode.OFF);
        await interaction.followUp({ content: "Loop has been disabled" });
    }
    else {
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        await interaction.followUp({ content: "Loop has been enabled" });
    }
}
