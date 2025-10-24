import { useQueue } from "discord-player";
/**
 * Plays the previous song
 * @implements {buttonCommand}
 */
export class PreviousButtonCommand {
    customId = "prev";
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        if (!queue.history.previousTrack)
            return void await interaction.followUp({ content: "No song to return to.", flags: "Ephemeral" });
        await queue.history.previous(true);
    }
}
