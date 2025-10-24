import { useQueue } from "discord-player";
/**
 * Toggle shuffling feature
 * @implements {buttonCommand}
 */
export class ShuffleButtonCommand {
    customId = "shuffle";
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        queue.isShuffling ? queue.disableShuffle() : queue.enableShuffle();
        const content = `Shuffling has been ${queue.isShuffling ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content, flags: "SuppressNotifications" });
    }
}
