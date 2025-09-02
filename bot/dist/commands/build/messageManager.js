import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import colorsJson from "./extractorColors.json" with { type: "json" };
const colors = colorsJson;
export class messageManager {
    constructor(channel) {
        this.nowPlayingMessage = null;
        this.queueMessage = null;
        this.trackAddedMessage = null;
        this.searchMessage = null;
        this.queuePage = 0;
        this.channel = channel;
    }
    buildButtons() {
        const playerButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('previous').setLabel('⏮️ Prev').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('pause').setLabel('⏯ Pause/Play').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('skip').setLabel('⏭️ Next').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('stop').setLabel('⛔ Stop').setStyle(ButtonStyle.Danger));
        const playerButtons2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('repeat').setLabel('🔂 Loop Song').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('loop').setLabel('🔁 Loop Queue').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('shuffle').setLabel('🔀 Shuffle').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('autoplay').setLabel('▶️ AutoPlay').setStyle(ButtonStyle.Primary));
        return [playerButtons, playerButtons2];
    }
    buildSearchEmbed(searchResult, source) {
        const tracks = searchResult.tracks.slice(0, 3);
        const color = colors[source] ?? 0x5865f2;
        const embeds = [];
        embeds.push(new EmbedBuilder()
            .setTitle(`Search Result from ${source}`)
            .setColor(color)
            .addFields({ name: "Requested By", value: searchResult.requestedBy.username ?? "Unknown" })
            .setFooter({ text: "Select a track below" }));
        tracks.forEach(track => {
            embeds.push(new EmbedBuilder()
                .setColor(color)
                .setTitle(track.cleanTitle)
                .setURL(track.url)
                .setThumbnail(track.thumbnail)
                .addFields({ name: "Duration", value: track.duration, inline: true }));
        });
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("selectedTrack")
            .setPlaceholder("Select a track to play");
        tracks.forEach(track => {
            selectMenu.addOptions({ label: track.cleanTitle.slice(0, 100), description: `${track.author.slice(0, 50)} • ${track.duration}`, value: track.url });
        });
        const row = new ActionRowBuilder().addComponents(selectMenu);
        return { embeds, components: [row] };
    }
    buildTrackEmbed(item) {
        const isPlaylist = "tracks" in item;
        const id = isPlaylist ? item.tracks[0]?.raw?.source ?? "default" : item.raw?.source ?? "default";
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
    async updateNowPlaying(track) {
        const embed = new EmbedBuilder()
            .setColor(0x1db954)
            .setAuthor({ name: "Now Playing 🎶", iconURL: track.thumbnail })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail("https://cdn.discordapp.com/attachments/1154672911567818763/1412336714311143484/hatuneMiku.gif")
            .addFields({ name: "Duration", value: track.duration, inline: true }, { name: "Requested by", value: track.requestedBy?.username || "Unknown", inline: true })
            .setFooter({ text: "Enjoy your music!", iconURL: "https://cdn-icons-png.flaticon.com/128/9280/9280598.png" });
        if (this.nowPlayingMessage) {
            try {
                await this.nowPlayingMessage.delete();
            }
            catch { }
        }
        this.nowPlayingMessage = await this.channel.send({ embeds: [embed], components: this.buildButtons() });
    }
    /** Persistent Queue embed showing NEXT song with thumbnail */
    async updateQueue(queue) {
        const tracks = queue.tracks.toArray();
        const pageSize = 10;
        const totalPages = Math.ceil(tracks.length / pageSize) || 1;
        this.queuePage = Math.min(this.queuePage, totalPages - 1);
        const nextTrack = tracks[0]; // next song in queue
        const buildQueueEmbed = (pageIndex) => {
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const queuePage = tracks.slice(start, end)
                .map((song, i) => `\`${start + i + 1}.\` [${song.title}] \`[${song.duration}]\` — ${song.requestedBy.displayName}`)
                .join("\n");
            return new EmbedBuilder()
                .setColor(0x1db954)
                .setTitle("🎶 Current Queue")
                .setThumbnail(nextTrack?.thumbnail)
                .setDescription(nextTrack
                ? `**▶️ Next Song:**\n[${nextTrack.title}] \`[${nextTrack.duration}]\`\nRequested by: **${nextTrack.requestedBy.displayName}**\n\n` +
                    (queuePage.length > 0 ? `**📜 Up Next:**\n${queuePage}` : `✅ Queue is empty.`)
                : "✅ Queue is empty.")
                .setFooter({ text: `Page ${pageIndex + 1}/${totalPages} • ${queue.getSize()} total song${queue.getSize() !== 1 ? "s" : ""}` });
        };
        const buildQueueButtons = (pageIndex) => new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId("queue_prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === 0), new ButtonBuilder()
            .setCustomId("queue_next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === totalPages - 1));
        if (this.queueMessage) {
            await this.queueMessage.edit({ embeds: [buildQueueEmbed(this.queuePage)], components: [buildQueueButtons(this.queuePage)] });
        }
        else {
            this.queueMessage = await this.channel.send({ embeds: [buildQueueEmbed(this.queuePage)], components: [buildQueueButtons(this.queuePage)] });
        }
    }
    async handleQueueButton(interaction, queue) {
        const tracks = queue.tracks.toArray();
        const pageSize = 10;
        const totalPages = Math.ceil(tracks.length / pageSize) || 1;
        if (interaction.customId === "queue_prev" && this.queuePage > 0)
            this.queuePage--;
        else if (interaction.customId === "queue_next" && this.queuePage < totalPages - 1)
            this.queuePage++;
        const start = this.queuePage * pageSize;
        const end = start + pageSize;
        const queuePage = tracks.slice(start, end)
            .map((song, i) => `\`${start + i + 1}.\` [${song.title}] \`[${song.duration}]\` — ${song.requestedBy.displayName}`)
            .join("\n");
        const nextTrack = tracks[0];
        const embed = new EmbedBuilder()
            .setColor(0x1db954)
            .setTitle("🎶 Current Queue")
            .setThumbnail(nextTrack?.thumbnail)
            .setDescription(nextTrack
            ? `**▶️ Next Song:**\n[${nextTrack.title}] \`[${nextTrack.duration}]\`\nRequested by: **${nextTrack.requestedBy.displayName}**\n\n` +
                (queuePage.length > 0 ? `**📜 Up Next:**\n${queuePage}` : `✅ Queue is empty.`)
            : "✅ Queue is empty.")
            .setFooter({ text: `Page ${this.queuePage + 1}/${totalPages} • ${queue.getSize()} total song${queue.getSize() !== 1 ? "s" : ""}` });
        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId("queue_prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(this.queuePage === 0), new ButtonBuilder()
            .setCustomId("queue_next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(this.queuePage === totalPages - 1));
        await interaction.update({ embeds: [embed], components: [buttons] });
    }
    async showTrackAdded(item) {
        const embed = this.buildTrackEmbed(item);
        if (this.trackAddedMessage) {
            try {
                await this.trackAddedMessage.delete();
            }
            catch { }
        }
        this.trackAddedMessage = await this.channel.send({ embeds: [embed] });
        setTimeout(() => this.trackAddedMessage?.delete().catch(() => { }), 10000);
    }
    async showSearchResults(searchResult, source) {
        const { embeds, components } = this.buildSearchEmbed(searchResult, source);
        if (this.searchMessage) {
            try {
                await this.searchMessage.delete();
            }
            catch { }
        }
        this.searchMessage = await this.channel.send({ embeds, components });
        setTimeout(() => this.searchMessage?.delete().catch(() => { }), 30000);
    }
    async clearSearchResults() {
        if (this.searchMessage) {
            try {
                await this.searchMessage.delete();
            }
            catch { }
            this.searchMessage = null;
        }
    }
}
