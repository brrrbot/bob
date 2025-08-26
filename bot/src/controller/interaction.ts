import { Client, GuildMember, Interaction } from "discord.js";
import { handleSlash } from "./slash.js";
import { handleButton } from "./buttons.js";
import { Player } from "discord-player";

export function handleInteraction(client: Client, player: Player) {

    client.on("interactionCreate", async (interaction: Interaction) => {

        if (interaction.isChatInputCommand()) {
            if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) { return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true }) }
            if (interaction.guild!.members.me!.voice.channelId && interaction.member.voice.channelId !== interaction.guild!.members.me!.voice.channelId) { return void interaction.reply({ content: "You are not in my voice channel!", ephemeral: true }) }
            handleSlash(player, interaction);

        } else if (interaction.isButton()) {
            if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) { return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true }) }
            if (interaction.guild!.members.me!.voice.channelId && interaction.member.voice.channelId !== interaction.guild!.members.me!.voice.channelId) { return void interaction.reply({ content: "You are not in my voice channel!", ephemeral: true }) }
            if (interaction.customId.startsWith("queue_")) return // defer to queue collector
            handleButton(interaction);

        } else {
            return;
        }
    })
}