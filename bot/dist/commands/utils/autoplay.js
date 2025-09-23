import { QueueRepeatMode, useQueue } from "discord-player";
export class AutoplayButtonCommand {
    constructor() {
        this.customId = "autoplay";
    }
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
        }
        else {
            queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
        }
        const content = queue.repeatMode === QueueRepeatMode.AUTOPLAY ? "Autoplay has been enabled." : "Autoplay has been disabled.";
        await interaction.followUp({ content: content });
    }
}
