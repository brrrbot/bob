import { commandFactory } from "../commands/commandFactory.js";
export async function handleButton(interaction) {
    const cmd = commandFactory.getButtonCommand(interaction.customId);
    await cmd.execute(interaction);
}
