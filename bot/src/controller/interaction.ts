import { Client, GuildMember, ChatInputCommandInteraction, ButtonInteraction, Interaction } from "discord.js";
import { Player } from "discord-player";
import { SlashHandler } from "./slash.js";
import { ButtonHandler } from "./buttons.js";

export class InteractionHandler {
    private client: Client;
    private player: Player;
    private buttonHandler: ButtonHandler;
    private slashHandler: SlashHandler;

    constructor(client: Client, player: Player) {
        this.client = client;
        this.player = player;
        this.buttonHandler = new ButtonHandler(player);
        this.slashHandler = new SlashHandler(player);
    }

    public register() {
        this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
    }

    private async onInteractionCreate(interaction: Interaction): Promise<void> {
        if (!(await this.ensureUserInVoiceChannel(interaction))) {
            return
        }

        if (interaction.isChatInputCommand()) {
            await this.slashHandler.handle(interaction as ChatInputCommandInteraction);
        } else if (interaction.isButton()) {
            if (interaction.customId.startsWith("queue_")) return;
            await this.buttonHandler.handle(interaction as ButtonInteraction);
        } else {
            return
        }
    }

    private async ensureUserInVoiceChannel(interaction: Interaction): Promise<Boolean> {
        if(interaction.isChatInputCommand() || interaction.isButton()) {
            if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
                await interaction.reply({ content: "You are not in a voice channel!", flags: "Ephemeral" });
                return false;
            }

            const botVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
            const memberVoiceChannelId = interaction.member.voice.channelId;

            if (botVoiceChannelId && memberVoiceChannelId !== botVoiceChannelId) {
                await interaction.reply({ content: "You are not in my voice channel!", flags: "Ephemeral" });
                return false
            }
        }
        return true;
    }
}