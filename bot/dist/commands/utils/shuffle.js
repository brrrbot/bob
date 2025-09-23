import { useQueue } from "discord-player";
export class ShuffleButtonCommand {
    constructor() {
        this.customId = "shuffle";
    }
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        if (queue.isShuffling) {
            queue.disableShuffle();
        }
        else {
            queue.enableShuffle();
        }
        const content = `Shuffling has been ${queue.isShuffling ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content, flags: "SuppressNotifications" });
    }
}
