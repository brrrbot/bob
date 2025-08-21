import { QueueRepeatMode, useQueue } from "discord-player";
export class repeat {
    constructor() {
        this.name = "repeat";
    }
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void interaction.followUp({ content: "There is no queue in this server" });
        if (queue.repeatMode === QueueRepeatMode.TRACK) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            await interaction.followUp({ content: "Repeat song has been disabled" });
        }
        else {
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            await interaction.followUp({ content: "Repeat song has been enabled" });
        }
    }
}
