import { ButtonInteraction } from "discord.js";
import { stop } from "../commands/utils/stop";
import { autoplay } from "../commands/utils/autoplay";
import { loop } from "../commands/utils/loop";
import { pause } from "../commands/utils/pause";
import { prev } from "../commands/utils/previous";
import { repeat } from "../commands/utils/repeat";
import { shuffle } from "../commands/utils/shuffle";
import { skip } from "../commands/utils/skip";

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