import { useQueue } from "discord-player";
export class PauseButtonCommand {
    customId = "pause";
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        queue.node.setPaused(!queue.node.isPaused());
        const content = queue.node.isPaused() ? "Music Paused." : "Music Resumed.";
        await interaction.followUp({ content: content, flags: "SuppressNotifications" });
    }
}
