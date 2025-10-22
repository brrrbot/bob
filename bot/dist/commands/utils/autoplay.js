import { QueueRepeatMode, useQueue } from "discord-player";
export class AutoplayButtonCommand {
    customId = "autoplay";
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
        const content = `Autoplay has been ${queue.repeatMode === QueueRepeatMode.AUTOPLAY ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content });
    }
}
