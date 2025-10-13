import { PlayCommand } from "../commands/music/play";
import { SearchCommand } from "../commands/music/search";
export class SlashHandler {
    constructor(playerInstance) {
        this.player = playerInstance;
        this.commands = new Map();
        this.loadCommands();
    }
    loadCommands() {
        const slashCommands = [
            new PlayCommand(),
            new SearchCommand(),
        ];
        for (const command of slashCommands) {
            this.commands.set(command.commandName, command);
        }
        console.log(`Loaded ${this.commands.size} slash commands.`);
    }
    getAllCommandData() {
        return Array.from(this.commands.values()).map(command => command.data.toJSON());
    }
    async handle(interaction) {
        const command = this.commands.get(interaction.commandName);
        if (!command) {
            console.warn(`No handler found for slash command: ${interaction.commandName}`);
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({ content: "Unknown command.", flags: "Ephemeral" });
            }
            else if (interaction.deferred) {
                await interaction.followUp({ content: "Unknown command.", flags: "Ephemeral" });
            }
            return;
        }
        try {
            await command.execute(interaction, this.player);
        }
        catch (error) {
            console.error(`Error executing slash command '${interaction.commandName}':`, error);
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({ content: "An unexpected error occurred while processing your command.", flags: "Ephemeral" });
            }
            else if (interaction.deferred) {
                await interaction.followUp({ content: "An unexpected error occurred.", flags: "Ephemeral" });
            }
        }
    }
}
