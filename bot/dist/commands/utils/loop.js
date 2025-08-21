import { QueueRepeatMode, useQueue } from "discord-player";
export class loop {
    constructor() {
        this.name = "loop";
    }
    async execute(interaction) {
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
}
