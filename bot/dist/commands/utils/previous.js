import { useQueue } from "discord-player";
export async function prev(interaction) {
    const queue = useQueue(interaction.guildId);
    if (!queue)
        return void interaction.followUp({ content: "There is no queue in this server" });
    if (!queue.history.previousTrack)
        return void interaction.followUp({ content: "This is the first song of the queue" });
    queue.history.previous(true);
}
