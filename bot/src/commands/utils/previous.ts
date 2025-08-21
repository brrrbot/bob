import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../commands.js";
import { useQueue } from "discord-player";

export class previous implements buttonCommand {
    name = "previous";

    async execute(interaction: ButtonInteraction): Promise<void> {
        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
        if (!queue.history.previousTrack) return void interaction.followUp({ content: "This is the first song of the queue" });
        queue.history.previous(true);
    }
}