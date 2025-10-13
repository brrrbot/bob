import { ButtonInteraction } from "discord.js";
import { Player } from "discord-player";

export interface buttonCommand {
    customId: string;

    execute(interaction: ButtonInteraction, player: Player): Promise<void>;
}