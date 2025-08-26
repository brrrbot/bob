import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { play } from "../commands/music/play.js";
import { search } from "../commands/music/search.js";

/**
 * Handles all incoming slash commands
 * @param player - Player instances
 * @param interaction - Slash command interaction
 */
export async function handleSlash(player: Player, interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const commandMap: Record<string, (p: Player, i: ChatInputCommandInteraction) => Promise<any>> = {
        play,
        search
    };
    const command = commandMap[interaction.commandName];
    try {
        await command(player, interaction);
    } catch (error) {
        console.error("Error performing slash commands: ", error);
        await interaction.followUp({ content: "Something went wrong while handling this action" });
    }
}