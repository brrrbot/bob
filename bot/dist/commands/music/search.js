// import { YoutubeExtractor } from "discord-player-youtubei";
import { YoutubeSabrExtractor as YoutubeExtractor } from "../../youtubeExtractor/youtubeExtractor.js";
import BotConfig from "../../config/config.json" with { type: "json" };
import { SpotifyExtractor } from "discord-player-spotify";
import { ActionRowBuilder, ButtonBuilder, ComponentType, GuildMember, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { buildEmbed, buildSearchEmbed } from "../build/embedBuilder.js";
const extractorMap = {
    "Youtube": YoutubeExtractor.identifier,
    "Spotify": SpotifyExtractor.identifier,
    // "Radiko": RadikoExtractor.identifier, - disabled becos need work on it more
};
/**
 * /search command functionality
 * Handles searching of music and returning top 3 results for playing
 * @implements {SlashCommand}
 */
export class SearchCommand {
    /**
     * Name of command
     * @readonly
     */
    commandName = "search";
    /**
     * Command's configuration and definition
     * @readonly
     */
    data = new SlashCommandBuilder()
        .setName("search")
        .setDescription("Searchs for song by name. (Playlist does not work, use /play instead.)")
        .addStringOption(option => option.setName("source")
        .setDescription("Specify the source to search from.")
        .setRequired(true)
        .addChoices({ name: "Youtube", value: "Youtube" }, { name: "Spotify", value: "Spotify" }))
        .addStringOption(option => option.setName("query")
        .setDescription("Song name to search for.")
        .setRequired(true));
    /**
     * main logic
     * @param interaction Discord /search interaction
     * @param player Player instance
     * @returns {Promise<void>}
     */
    async execute(interaction, player) {
        await interaction.deferReply();
        const query = interaction.options.getString("query", true);
        const source = interaction.options.getString("source", true);
        const member = interaction.member;
        if (!(member instanceof GuildMember))
            return void await interaction.followUp({ content: "This command can only be used in a server.", flags: "Ephemeral" });
        const channel = member.voice.channel;
        if (!channel)
            return void await interaction.followUp({ content: "You are not in a voice channel.", flags: "Ephemeral" });
        const botVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
        if (botVoiceChannelId && channel.id !== botVoiceChannelId)
            return void await interaction.followUp({ content: "You are not in my voice channel.", flags: "Ephemeral" });
        let searchEngine = extractorMap[source];
        if (!searchEngine)
            return void await interaction.followUp({ content: `Invalid search source: ${source}.`, flags: "Ephemeral" });
        let searchResult;
        try {
            searchResult = await player.search(query, {
                requestedBy: interaction.user,
                searchEngine: `ext:${searchEngine}`,
            });
        }
        catch (error) {
            console.error("Error occurred while searching: ", error);
            return void await interaction.followUp({ content: "An error occurred while searching.", flags: "Ephemeral" });
        }
        if (!searchResult || !searchResult.tracks.length)
            return void await interaction.followUp({ content: "No result found!", flags: "Ephemeral" });
        let queue = player.nodes.get(interaction.guild);
        if (!queue) {
            queue = player.nodes.create(interaction.guild, {
                metadata: interaction.channel,
                ...BotConfig.discordPlayer.playerOptions,
            });
        }
        try {
            if (!queue.connection)
                await queue.connect(channel);
        }
        catch (error) {
            console.error("Error joining voice channel: ", error);
            return void await interaction.followUp({ content: "Could not join voice channel.", flags: "Ephemeral" });
        }
        let reply;
        try {
            reply = await interaction.followUp(buildSearchEmbed(searchResult, source));
        }
        catch (error) {
            console.error("Failed to send search embed: ", error);
            return void await interaction.followUp({ content: "Failed to display search results.", flags: "Ephemeral" });
        }
        const filter = (i) => i.user.id === interaction.user.id && i.customId === "selectedTrack";
        let selectedInteraction;
        try {
            selectedInteraction = await reply.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 60_000 });
            await selectedInteraction.deferUpdate();
            const trackURL = selectedInteraction.values[0];
            const track = searchResult.tracks.find(t => t.url === trackURL);
            if (!track) {
                await selectedInteraction.followUp({ content: "The selected track was not found.", flags: "Ephemeral" });
            }
            else {
                queue.addTrack(track);
                await selectedInteraction.followUp({ embeds: [buildEmbed(track)] });
                if (!queue.node.isPlaying())
                    await queue.node.play();
            }
        }
        catch (error) {
            console.error("Search select menu interaction timed out or failed: ", error);
            if (error.message?.includes('Collector received no interactions before the time limit')) {
                void await interaction.followUp({ content: "Search selection menu expired, no track was added.", ephemeral: true });
            }
            else {
                void await interaction.followUp({ content: "An error occurred during selection.", ephemeral: true });
            }
        }
        finally {
            try {
                const fetchedMsg = await interaction.channel?.messages.fetch(reply.id);
                if (fetchedMsg) {
                    const actionRows = fetchedMsg.components;
                    const disabledComponents = actionRows.map(fetchedRow => {
                        const newActionRowBuilder = new ActionRowBuilder();
                        const updatedInnerComponents = fetchedRow.components.map(component => {
                            if (component.type === ComponentType.StringSelect) {
                                return StringSelectMenuBuilder.from(component.toJSON()).setDisabled(true);
                            }
                            else if (component.type === ComponentType.Button) {
                                return ButtonBuilder.from(component.toJSON()).setDisabled(true);
                            }
                            throw new Error(`Unexpected component type in row: ${component.type}`);
                        });
                        return newActionRowBuilder.setComponents(updatedInnerComponents).toJSON();
                    });
                    await fetchedMsg.edit({ components: disabledComponents });
                }
            }
            catch (error) {
                console.error("Error disabling search select menu components:", error);
            }
        }
    }
}
