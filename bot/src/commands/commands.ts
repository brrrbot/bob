import { ButtonInteraction } from "discord.js";

export interface buttonCommand {
    name: string;
    execute(interaction: ButtonInteraction): Promise<void>;
}