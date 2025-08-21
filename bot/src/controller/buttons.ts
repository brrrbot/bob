import { ButtonInteraction } from "discord.js";
import { commandFactory } from "../commands/commandFactory.js";

export async function handleButton(interaction: ButtonInteraction) {
    const cmd = commandFactory.getButtonCommand(interaction.customId);
    await cmd!.execute(interaction);
}
