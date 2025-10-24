import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import type { ColorResolvable, InteractionReplyOptions } from "discord.js";
import { Track, Playlist, SearchResult } from "discord-player";
import colorsJson from "./colors.json" with { type: "json" };

type ColorsType = Record<string, ColorResolvable>
const colors = colorsJson as ColorsType;

/**
 * Build embed with video info
 * @param item Track or Playlist
 * @returns Discord embed object
 */
export function buildEmbed(item: Track | Playlist) {
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
        .setThumbnail(item.thumbnail ?? null)
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

/**
 * Build search embed
 * @param searchResult Search Result from discord-player search
 * @param source Source where music is from
 * @returns Search embed with select menu
 */
export function buildSearchEmbed(searchResult: SearchResult, source: string): InteractionReplyOptions {
    const tracks = searchResult.tracks.slice(0, 3);
    const color = colors[source.toLocaleLowerCase()] ?? 0x5865f2;

    const embed = new EmbedBuilder()
        .setTitle(`Search Results from ${source}`)
        .setColor(color)
        .setFooter({ text: "Select a track below" })
        .setThumbnail(searchResult.requestedBy.avatarURL())
        .addFields(
            { name: "Requested By", value: searchResult.requestedBy.username ?? "Unknown" }
        );

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
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(track.cleanTitle.slice(0, 100))
                .setDescription(`${track.author.slice(0, 50)} • ${track.duration}`)
                .setValue(track.url)
        );
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    return { embeds: [embed], components: [row] };
}