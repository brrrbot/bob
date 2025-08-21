import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../commands.js";
import { QueueRepeatMode, useQueue } from "discord-player";

export class repeat implements buttonCommand {
    name = "repeat";

    async execute(interaction: ButtonInteraction): Promise<void> {
        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
        if (queue.repeatMode === QueueRepeatMode.TRACK) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            await interaction.followUp({ content: "Repeat song has been disabled" });
        } else {
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            await interaction.followUp({ content: "Repeat song has been enabled" });
        }
    }
}