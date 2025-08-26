import { play } from "../commands/music/play.js";
import { search } from "../commands/music/search.js";
export async function handleSlash(player, interaction) {
    await interaction.deferReply();
    const commandMap = {
        play,
        search
    };
    const command = commandMap[interaction.commandName];
    try {
        await command(player, interaction);
    }
    catch (error) {
        console.error("Error performing slash commands: ", error);
        await interaction.followUp({ content: "Something went wrong while handling this action" });
    }
}
