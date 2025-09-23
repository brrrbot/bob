import { useQueue, QueueRepeatMode } from "discord-player";
export class RepeatButtonCommand {
    constructor() {
        this.customId = "repeat";
    }
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        if (queue.repeatMode === QueueRepeatMode.TRACK) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            await interaction.followUp({ content: "Repeat song has been disabled.", flags: "SuppressNotifications" });
        }
        else {
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            await interaction.followUp({ content: "Repeat song has been enabled.", flags: "SuppressNotifications" });
        }
    }
}
