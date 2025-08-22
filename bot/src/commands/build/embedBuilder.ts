import { Player, Playlist, Track } from "discord-player";
import { EmbedBuilder, ColorResolvable } from "discord.js";
import colorsJson from "./colors.json" with { type: "json" };
import { buttons } from "./buttonBuilder.js";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "discord-player-spotify";

// Type assertion for JSON to match ColorResolvable
type ColorsType = Record<string, ColorResolvable>;
const colors = colorsJson as ColorsType;

// Map extractors to colors
const youtubeIdentifier = YoutubeiExtractor.identifier;
const spotifyIdentifier = SpotifyExtractor.identifier;
const colorMap: Record<string, string> = {
    youtubeIdentifier: "youtube",
    spotifyIdentifier: "spotify",
};

export function buildEmbedForSong(track: Track) {
    console.log(track);
    const id = track.extractor?.identifier ?? "default";
    const color = colors[colorMap[id]] || colors.default;

    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Song Added to Queue!",
            iconURL: "https://cdn-icons-png.flaticon.com/128/3659/3659784.png",
        })
        .setTitle(track.title)
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: "Song Artist", value: track.author },
            { name: "Duration", value: track.duration, inline: true },
            { name: "Requested By", value: track.requestedBy?.username || "Unknown", inline: true }
        )
        .setFooter({
            text: "Stay Tuned!",
            iconURL: "https://cdn-icons-png.flaticon.com/128/19002/19002018.png",
        });
}

export function buildEmbedForPlaylist(playlist: Playlist) {
    const id = playlist.tracks[0]?.extractor?.identifier ?? "default";
    const color = colors[id] || colors.default;

    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Playlist Added to Queue!",
            iconURL: "https://cdn-icons-png.flaticon.com/128/3659/3659784.png",
        })
        .setTitle(playlist.title)
        .setURL(playlist.url)
        .setThumbnail(playlist.thumbnail)
        .addFields(
            { name: "Playlist Length", value: `${playlist.tracks.length} songs`, inline: true },
            { name: "Requested By", value: playlist.tracks[0]?.requestedBy?.username || "Unknown", inline: true }
        )
        .setFooter({
            text: "Stay Tuned!",
            iconURL: "https://cdn-icons-png.flaticon.com/128/19002/19002018.png",
        });
}

function buildPlayerStartEmbed(track: Track) {
    const id = track.extractor?.identifier ?? "default";
    const color = colors[id] || colors.default;

    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({ name: "Now Playing", iconURL: track.thumbnail })
        .setTitle(track.title)
        .setURL(track.url)
        .setImage("https://tenor.com/bXrMu.gif")
        .addFields(
            { name: "Duration", value: track.duration, inline: true },
            { name: "Requested By", value: track.requestedBy?.username || "Unknown", inline: true }
        )
        .setFooter({
            text: "Enjoy your music!",
            iconURL: "https://cdn-icons-png.flaticon.com/128/9280/9280598.png",
        });
}

export function playerStart(player: Player) {
    player.events.on("playerStart", (queue, track) => {
        queue.metadata.send({ embeds: [buildPlayerStartEmbed(track)], components: buttons() })
    })
}