import { SpotifyExtractor } from "discord-player-spotify";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { ComponentType } from "discord.js";
import { buildEmbed, buildSearchEmbed } from "../build/embedBuilder.js";
const extractorMap = {
    "youtube": YoutubeiExtractor.identifier,
    "spotify": SpotifyExtractor.identifier,
};
export async function search(player, interaction) {
    const query = interaction.options.getString("query");
    const source = interaction.options.getString("source");
    const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: `ext:${extractorMap[source]}`,
    });
    if (!searchResult || !searchResult.tracks.length)
        return void interaction.followUp({ content: "No results found!" });
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
    const reply = await interaction.followUp(buildSearchEmbed(searchResult, source));
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000, // 1 minute
    });
    collector.on("collect", async (i) => {
        await i.deferReply();
        if (i.user.id !== interaction.user.id)
            return i.followUp({ content: "This menu isn't for you!" });
        const trackURL = i.values[0];
        const track = searchResult.tracks.find(t => t.url === trackURL);
        if (!track)
            return void i.followUp({ content: "Track not found!" });
        queue.addTrack(track);
        if (!queue.node.isPlaying())
            await queue.node.play();
        await i.followUp({ embeds: [buildEmbed(track)] });
        collector.stop();
    });
}
