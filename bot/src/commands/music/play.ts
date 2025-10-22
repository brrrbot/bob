import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../interfaces/slashInterface.js";
import { Player, QueryType, SearchQueryType } from "discord-player";
import { buildEmbed } from "../build/embedBuilder.js";
import BotConfig from "../../config/config.json" with { type: "json" };

export class PlayCommand implements SlashCommand {
    public readonly commandName: string = "play";

    public readonly data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song/playlist or adds it to queue.")
    .addStringOption(option => 
        option.setName("query")
        .setDescription("The song URL (Inputting name might not work, use /search instead.)")
        .setRequired(true)
    )
    
    public async execute(interaction: ChatInputCommandInteraction, player: Player): Promise<void> {
        await interaction.deferReply();

        const query = interaction.options.getString("query", true);

        const member = interaction.member;
        if (!(member instanceof GuildMember)) return void await interaction.followUp({ content: "This command can only be used in a server.", flags: "Ephemeral" });

        const channel = member.voice.channel;
        if (!channel) return void await interaction.followUp({ content: "You are not in a voice channel.", flags: "Ephemeral" });

        const botVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
        if (botVoiceChannelId && channel.id !== botVoiceChannelId) return void await interaction.followUp({ content: "You are not in my voice channel.", flags: "Ephemeral" });

        let searchEngine: SearchQueryType = QueryType.AUTO;
        if (/radiko\.jp/.test(query)) searchEngine = `ext:radiko` as SearchQueryType;

        try {
            // @ts-expect-error
            const { track, searchResult } = await player.play(channel, query, {
                requestedBy: interaction.user,
                searchEngine: searchEngine,
                nodeOptions: {
                    metadata: interaction.channel,
                    ...BotConfig.discordPlayer.playerOptions,
                }
            });

            const embed = buildEmbed(searchResult.playlist ?? track);
            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.error("Error while excuting PlayCommand: ", error);
            await interaction.followUp({ content: "An unexpected error occurred.", flags: "Ephemeral" });
        }
    }
}