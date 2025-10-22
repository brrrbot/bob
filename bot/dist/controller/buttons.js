import { AutoplayButtonCommand } from "../commands/utils/autoplay.js";
import { LoopButtonCommand } from "../commands/utils/loop.js";
import { PauseButtonCommand } from "../commands/utils/pause.js";
import { PreviousButtonCommand } from "../commands/utils/previous.js";
import { QueueButtonCommand } from "../commands/utils/queue.js";
import { RepeatButtonCommand } from "../commands/utils/repeat.js";
import { ShuffleButtonCommand } from "../commands/utils/shuffle.js";
import { SkipButtonCommand } from "../commands/utils/skip.js";
import { StopButtonCommand } from "../commands/utils/stop.js";
export class ButtonHandler {
    commands;
    player;
    constructor(playerInstance) {
        this.player = playerInstance;
        this.commands = new Map();
        this.loadCommands();
    }
    loadCommands() {
        const buttonCommands = [
            new AutoplayButtonCommand(),
            new LoopButtonCommand(),
            new PauseButtonCommand(),
            new PreviousButtonCommand(),
            new QueueButtonCommand(),
            new RepeatButtonCommand(),
            new ShuffleButtonCommand(),
            new SkipButtonCommand(),
            new StopButtonCommand(),
        ];
        for (const command of buttonCommands) {
            this.commands.set(command.customId, command);
        }
        console.log(`Loaded ${this.commands.size} button commands`);
    }
    async handle(interaction) {
        const command = this.commands.get(interaction.customId);
        if (command) {
            try {
                await command.execute(interaction, this.player);
            }
            catch (error) {
                console.error(`Error executing button command '${interaction.customId}': `, error);
                if (!interaction.deferred && !interaction.replied)
                    await interaction.reply({ content: "An error occurred while executing command.", flags: "Ephemeral" });
                else
                    await interaction.followUp({ content: "An unexpected error occurred.", flags: "Ephemeral" });
            }
        }
        else {
            console.warn(`No handler found for button customId: ${interaction.customId}`);
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({ content: "This button does not have a registered handler.", ephemeral: true });
            }
            else {
                await interaction.followUp({ content: "This button does not have a registered handler.", ephemeral: true });
            }
        }
    }
}
