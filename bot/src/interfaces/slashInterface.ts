import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Player } from "discord-player";

export interface SlashCommand {
    readonly commandName: string;

    readonly data:
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandOptionsOnlyBuilder
        | SlashCommandBuilder;

    execute(interaction: ChatInputCommandInteraction, player: Player): Promise<void>;

    readonly cooldown?: number;
}