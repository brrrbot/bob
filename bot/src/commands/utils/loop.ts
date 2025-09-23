import { useQueue, QueueRepeatMode, Player } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../../interfaces/buttonInterface";

export class LoopButtonCommand implements buttonCommand {
    public readonly customId: string = "loop";
    
    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });

        if (queue.repeatMode === QueueRepeatMode.QUEUE) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
        } else {
            queue.setRepeatMode(QueueRepeatMode.QUEUE);
        }

        const content = queue.repeatMode === QueueRepeatMode.QUEUE ? "Loop has been enabled." : "Loop has been disabled.";
        await interaction.followUp({ content: content });
    }
}