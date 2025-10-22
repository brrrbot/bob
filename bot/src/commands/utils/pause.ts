import { Player, useQueue } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../../interfaces/buttonInterface.js";

export class PauseButtonCommand implements buttonCommand {
    public readonly customId: string = "pause";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        
        queue.node.setPaused(!queue.node.isPaused());
        const content = queue.node.isPaused() ? "Music Paused." : "Music Resumed.";
        await interaction.followUp({ content: content, flags: "SuppressNotifications" });
    }
}