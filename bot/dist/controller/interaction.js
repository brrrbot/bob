import { GuildMember } from "discord.js";
import { SlashHandler } from "./slash.js";
import { ButtonHandler } from "./buttons.js";
export class InteractionHandler {
    client;
    player;
    buttonHandler;
    slashHandler;
    constructor(client, player) {
        this.client = client;
        this.player = player;
        this.buttonHandler = new ButtonHandler(player);
        this.slashHandler = new SlashHandler(player);
    }
    register() {
        this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
    }
    async onInteractionCreate(interaction) {
        if (!(await this.ensureUserInVoiceChannel(interaction))) {
            return;
        }
        if (interaction.isChatInputCommand()) {
            await this.slashHandler.handle(interaction);
        }
        else if (interaction.isButton()) {
            if (interaction.customId.startsWith("queue_"))
                return;
            await this.buttonHandler.handle(interaction);
        }
        else {
            return;
        }
    }
    async ensureUserInVoiceChannel(interaction) {
        if (interaction.isChatInputCommand() || interaction.isButton()) {
            if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
                await interaction.reply({ content: "You are not in a voice channel!", flags: "Ephemeral" });
                return false;
            }
            const botVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
            const memberVoiceChannelId = interaction.member.voice.channelId;
            if (botVoiceChannelId && memberVoiceChannelId !== botVoiceChannelId) {
                await interaction.reply({ content: "You are not in my voice channel!", flags: "Ephemeral" });
                return false;
            }
        }
        return true;
    }
}
