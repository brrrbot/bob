import { ButtonInteraction } from "discord.js";
import { stop } from "../commands/utils/stop.js";
import { autoplay } from "../commands/utils/autoplay.js";
import { loop } from "../commands/utils/loop.js";
import { pause } from "../commands/utils/pause.js";
import { prev } from "../commands/utils/previous.js";
import { repeat } from "../commands/utils/repeat.js";
import { shuffle } from "../commands/utils/shuffle.js";
import { skip } from "../commands/utils/skip.js";

/**
 * Handle incoming button interaction
 * @param interaction - Button inraction that triggered the command
 */
export async function handleButton(interaction: ButtonInteraction) {
    await interaction.deferReply();
    const commandMap: Record<string, (i: ButtonInteraction) => Promise<any>> = {
        autoplay,
        loop,
        pause,
        prev,
        repeat,
        shuffle,
        skip,
        stop,
    };
    const command = commandMap[interaction.customId];
    try {
        await command(interaction);
    } catch (error) {
        console.error("Error performing button commands");
        await interaction.followUp({ content: "Something went wrong while handling this action" });
    }
}