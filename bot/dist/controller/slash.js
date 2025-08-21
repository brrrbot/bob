import { play } from "../commands/music/play.js";
/**
 * Handles incoming slash commands related to music playback.
 * @param interaction
 * @param player
 */
export async function handleSlash(interaction, player) {
    await interaction.deferReply();
    const commandMap = {
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
