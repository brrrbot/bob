import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { play } from "../commands/music/play.js"; 

/**
 * Handles incoming slash commands related to music playback.
 * @param interaction
 * @param player
 */
export async function handleSlash(interaction: ChatInputCommandInteraction, player: Player) {
    await interaction.deferReply();
    const commandMap: Record<string, string> = {
        yt: "youtube",
        sf: "spotify",
        ytp: "youtube-playlist",
        sfp: "spotify-playlist"
    };
    const source = commandMap[interaction.commandName];
    if (source) {
        play(interaction, player, source);
    }
}
