import { Player, useQueue } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { buttonCommand } from "../../interfaces/buttonInterface.js";

export class ShuffleButtonCommand implements buttonCommand {
    public readonly customId: string = "shuffle";

    public async execute(interaction: ButtonInteraction, player: Player): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const queue = useQueue(interaction.guildId);
        if (!queue) return void interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral"});

        queue.isShuffling ? queue.disableShuffle() : queue.enableShuffle();
        
        const content = `Shuffling has been ${queue.isShuffling ? "enabled" : "disabled"}`;
        await interaction.followUp({ content: content, flags: "SuppressNotifications" });
    }
}