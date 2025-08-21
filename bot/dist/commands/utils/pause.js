import { useQueue } from "discord-player";
export class pause {
    constructor() {
        this.name = "pause";
    }
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void interaction.followUp({ content: "There is no queue in this server" });
        queue.node.setPaused(!queue.node.isPaused());
        await interaction.followUp({ content: queue.node.isPaused ? "Music Paused" : "Music Resumed" });
    }
}
