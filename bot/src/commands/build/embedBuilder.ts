import { ColorResolvable, EmbedBuilder } from "discord.js";
import { Track, Playlist, Player } from "discord-player";
import colorsJson from "./colors.json" with { type: "json" };
import { buttons } from "./buttonBuilder";

type ColorsType = Record<string, ColorResolvable>
const colors = colorsJson as ColorsType;

export function buildEmbed(item: Track | Playlist) {
    const isPlaylist = "tracks" in item;
    const id = isPlaylist
        ? item.tracks[0]?.extractor?.identifier ?? "default"
        : item.extractor?.identifier ?? "default";
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
        embed.addFields(
            { name: "Playlist Length", value: `${item.tracks.length} songs`, inline: true },
            { name: "Requested By", value: item.tracks[0]?.requestedBy?.username || "Unknown", inline: true }
        );
    } else {
        embed.addFields(
            { name: "Song Artist", value: item.author },
            { name: "Duration", value: item.duration, inline: true },
            { name: "Requested By", value: item.requestedBy?.username || "Unknown", inline: true }
        );
    }

    return embed;
}

export function buildStartEmbed(player: Player, track: Track) {
    player.events.on("playerStart", (queue, track) => {
        let embed = new EmbedBuilder();
        embed
            .setColor(0x1db954)
            .setAuthor({
                name: 'Now Playing 🎶',
                iconURL: track.thumbnail
            })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested by', value: track.requestedBy?.username || 'Unknown', inline: true },
            )
            .setFooter({
                text: 'Enjoy your music!',
                iconURL: 'https://cdn-icons-png.flaticon.com/128/9280/9280598.png'
            })
            queue.metadata.send({ embeds: [embed], components: buttons() });
    });
}