import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import colorsJson from "./colors.json" with { type: "json" };
import { buttons } from "./buttonBuilder.js";
const colors = colorsJson;
/**
 * Creates embed for when song/playlist is added into queue
 * @param item - Either searchResult.tracks[n] or searchResult.playlist.tracks
 * @returns embed value to be passed into "embeds:" in discord interaction replies
 */
export function buildEmbed(item) {
    const isPlaylist = "tracks" in item;
    const id = isPlaylist
        ? item.tracks[0]?.raw?.source ?? "default"
        : item.raw?.source ?? "default";
    const color = colors[id] || colors.default;
    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
        name: isPlaylist ? "Playlist Added to Queue!" : "Song Added to Queue!",
        iconURL: "https://cdn-icons-png.flaticon.com/128/3659/3659784.png",
    })
        .setTitle(item.title)
        .setURL(item.url)
        .setThumbnail(item.thumbnail)
        .setFooter({
        text: "Stay Tuned!",
        iconURL: "https://cdn-icons-png.flaticon.com/128/19002/19002018.png",
    });
    if (isPlaylist) {
        embed.addFields({ name: "Playlist Length", value: `${item.tracks.length} songs`, inline: true }, { name: "Requested By", value: item.tracks[0]?.requestedBy?.username || "Unknown", inline: true });
    }
    else {
        embed.addFields({ name: "Song Artist", value: item.author }, { name: "Duration", value: item.duration, inline: true }, { name: "Requested By", value: item.requestedBy?.username || "Unknown", inline: true });
    }
    return embed;
}
/**
 * Creates an embed based on user's query along with song select menu
 * @param searchResult - Search Results from /search command
 * @param source - Platform where song/playlist is extracted from for color picking
 * @returns object with search result embed and user select menu
 */
export function buildSearchEmbed(searchResult, source) {
    const tracks = searchResult.tracks.slice(0, 3);
    const color = colors[source.toLocaleLowerCase()] ?? 0x5865f2;
    const embed = new EmbedBuilder()
        .setTitle(`Search Results from ${source}`)
        .setColor(color)
        .setFooter({ text: "Select a track below" })
        .setThumbnail(searchResult.requestedBy.avatarURL())
        .addFields({ name: "Requested By", value: searchResult.requestedBy.username ?? "Unknown" });
    tracks.forEach((track, index) => {
        embed.addFields({
            name: `${index + 1}. ${track.cleanTitle}`,
            value: `Author: ${track.author}\nDuration: ${track.duration}`,
            inline: false,
        });
    });
    // Select menu
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("selectedTrack")
        .setPlaceholder("Select a track to play");
    tracks.forEach((track) => {
        selectMenu.addOptions(new StringSelectMenuOptionBuilder()
            .setLabel(track.cleanTitle.slice(0, 100))
            .setDescription(`${track.author.slice(0, 50)} • ${track.duration}`)
            .setValue(track.url));
    });
    const row = new ActionRowBuilder().addComponents(selectMenu);
    return { embeds: [embed], components: [row] };
}
/**
 * Player event handler to send embed for each new songs in queue playing
 * @param player - Player instances
 */
export function buildStartEmbed(player) {
    player.events.on("playerStart", (queue, track) => {
        let embed = new EmbedBuilder();
        embed
            .setColor("#39FF14")
            .setAuthor({
            name: 'Now Playing 🎶',
            iconURL: track.thumbnail
        })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail("https://cdn.discordapp.com/attachments/1154672911567818763/1412336714311143484/hatuneMiku.gif")
            .addFields({ name: 'Duration', value: track.duration, inline: true }, { name: 'Requested by', value: track.requestedBy?.username || 'Unknown', inline: true })
            .setFooter({
            text: 'Enjoy your music!',
            iconURL: 'https://cdn-icons-png.flaticon.com/128/9280/9280598.png'
        });
        queue.metadata.send({ embeds: [embed], components: buttons() });
    });
}
