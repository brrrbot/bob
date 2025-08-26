import { useQueue } from "discord-player";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";

export async function queue(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId);
    if (!queue) return void interaction.followUp({ content: "There is no queue in this server" });

    const tracks = queue.tracks.toArray();
    const pageSize = 10;
    let page = 0;
    const totalPages = Math.ceil(tracks.length / pageSize) || 1;

    const buildEmbed = (pageIndex) => {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        const queuePage = tracks.slice(start, end)
            .map((song, i) => `\`${start + i + 1}.\` [${song.title}] \`[${song.duration}]\` — ${song.requestedBy.displayName}`)
            .join("\n");

        return new EmbedBuilder()
            .setColor(0x1db954)
            .setTitle("🎶 Current Queue")
            .setThumbnail(queue.currentTrack.thumbnail)
            .setDescription(
                `**▶️ Now Playing:**\n[${queue.currentTrack.title}] \`[${queue.currentTrack.duration}]\`\n` +
                `Requested by: **${queue.currentTrack.requestedBy.displayName}**\n\n` +
                (queuePage.length > 0 ? `**📜 Up Next:**\n${queuePage}` : `✅ Queue is empty.`)
            )
            .setFooter({ text: `Page ${pageIndex + 1}/${totalPages} • ${queue.getSize()} total song${queue.getSize() !== 1 ? "s" : ""}` });
    };

    const buildButtons = (pageIndex) => new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("queue_prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === 0),
        new ButtonBuilder()
            .setCustomId("queue_next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === totalPages - 1)
    );

    let msg = await interaction.followUp({ embeds: [buildEmbed(page)], components: [buildButtons(page)] });
    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on("collect", async (btnInt) => {
        if (btnInt.customId === "queue_prev" && page > 0) page--;
        else if (btnInt.customId === "queue_next" && page < totalPages - 1) page++;

        await btnInt.update({ embeds: [buildEmbed(page)], components: [buildButtons(page)] });
    });
}