import { useQueue, QueueRepeatMode } from "discord-player";
import { ButtonInteraction } from "discord.js";

export async function repeat(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId);
    if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
    if (queue.repeatMode === QueueRepeatMode.TRACK) {
        queue.setRepeatMode(QueueRepeatMode.OFF);
        await interaction.followUp({ content: "Repeat song has been disabled" });
    } else {
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        await interaction.followUp({ content: "Repeat song has been enabled" });
    }
}