import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../commands.js";
import { useQueue } from "discord-player";

export class shuffle implements buttonCommand {
    name = "shuffle";

    async execute(interaction: ButtonInteraction): Promise<void> {
        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });
        if (queue.isShuffling) {
            queue.disableShuffle();
        } else {
            queue.enableShuffle();
        }
        await interaction.followUp({ content: queue.isShuffling ? "Shuffling has been enabled" : "Shuffling has been disabled"});
    }
}