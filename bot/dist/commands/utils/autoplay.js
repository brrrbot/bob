import { QueueRepeatMode, useQueue } from "discord-player";
export async function autoplay(interaction) {
    const queue = useQueue(interaction.guildId);
    if (!queue)
        return void interaction.followUp({ content: "There is no queue in this server" });
    if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
        queue.setRepeatMode(QueueRepeatMode.OFF);
        await interaction.followUp({ content: "Autoplay has been disabled" });
    }
    else {
        queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
        await interaction.followUp({ content: "Autoplay has been enabled" });
    }
}
