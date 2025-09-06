import { SpotifyExtractor } from "discord-player-spotify";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { ComponentType } from "discord.js";
import { buildEmbed, buildSearchEmbed } from "../build/embedBuilder.js";
import { RadikoExtractor } from "discord-player-radiko";
const extractorMap = {
    "Youtube": YoutubeiExtractor.identifier,
    "Spotify": SpotifyExtractor.identifier,
    "Radiko": RadikoExtractor.identifier,
};
/**
 * Search user's queries using specified extractor and calls buildSearchEmbed
 * @param player - Player instances
 * @param interaction - Slash command interaction
 */
export async function search(player, interaction) {
    const query = interaction.options.getString("query");
    const source = interaction.options.getString("source");
    let searchResult;
    try {
        searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: `ext:${extractorMap[source]}`,
        });
    }
    catch (err) {
        console.error("Search error:", err);
        return void interaction.followUp({ content: "There was an error searching for your query!" });
    }
    if (!searchResult || !searchResult.tracks.length) {
        return void interaction.followUp({ content: "No results found!" });
    }
    let queue = player.nodes.get(interaction.guild);
    if (!queue)
        queue = await player.nodes.create(interaction.guild, { metadata: interaction.channel });
    try {
        if (!queue.connection) {
            const member = interaction.member;
            await queue.connect(member.voice.channel);
        }
    }
    catch (error) {
        console.error("Error joining voice channel: ", error);
        void player.destroy();
        return void interaction.followUp({ content: "Could not join voice channel!" });
    }
    let reply;
    try {
        reply = await interaction.followUp(buildSearchEmbed(searchResult, source));
    }
    catch (err) {
        console.error("Failed to send search embed:", err);
        return;
    }
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000, // 1 minute
    });
    collector.on("collect", async (i) => {
        try {
            await i.deferReply();
            if (i.user.id !== interaction.user.id)
                return void i.followUp({ content: "This menu isn't for you!" });
            const trackURL = i.values[0];
            const track = searchResult.tracks.find(t => t.url === trackURL);
            if (!track)
                return void i.followUp({ content: "Track not found!" });
            console.log(track);
            queue.addTrack(track);
            await i.followUp({ embeds: [buildEmbed(track)] });
            if (!queue.node.isPlaying())
                await queue.node.play();
            collector.stop();
        }
        catch (err) {
            console.error("Collector error:", err);
            void i.followUp({ content: "An error occurred while handling your selection." });
        }
    });
    collector.on("end", collected => {
        if (collected.size === 0) {
            void interaction.followUp({ content: "Selection menu expired." });
        }
    });
}
