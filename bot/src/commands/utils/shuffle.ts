import { useQueue } from "discord-player";
import { ButtonInteraction } from "discord.js";

export async function shuffle(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId);
    if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
    if (queue.isShuffling) {
        queue.disableShuffle();
    } else {
        queue.enableShuffle();
    }
    await interaction.followUp({ content: queue.isShuffling ? "Shuffling has been enabled" : "Shuffling has been disabled" });
}