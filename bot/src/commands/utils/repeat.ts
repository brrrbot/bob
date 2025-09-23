import { useQueue, QueueRepeatMode, Player } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../../interfaces/buttonInterface";

export class RepeatButtonCommand implements buttonCommand {
    public readonly customId: string = "repeat";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral"});

        if (queue.repeatMode === QueueRepeatMode.TRACK) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            await interaction.followUp({ content: "Repeat song has been disabled.", flags: "SuppressNotifications" });
        } else {
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            await interaction.followUp({ content: "Repeat song has been enabled.", flags: "SuppressNotifications"});
        }
    }
}