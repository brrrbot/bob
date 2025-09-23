import { Player, QueueRepeatMode, useQueue } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../../interfaces/buttonInterface";

export class AutoplayButtonCommand implements buttonCommand {
    public readonly customId: string = "autoplay";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });

        if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
        } else {
            queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
        }

        const content = queue.repeatMode === QueueRepeatMode.AUTOPLAY ? "Autoplay has been enabled." : "Autoplay has been disabled.";
        await interaction.followUp({ content: content });
    }
}