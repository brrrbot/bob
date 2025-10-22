import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember } from "discord.js";
import { useQueue } from "discord-player";
export class QueueButtonCommand {
    customId = "queue";
    async execute(interaction, player) {
        if (!interaction.deferred && !interaction.replied)
            await interaction.deferUpdate();
        const member = interaction.member;
        if (!(member instanceof GuildMember))
            return void await interaction.followUp({ content: "This command can only be used in a server.", flags: "Ephemeral" });
        if (!member.voice.channel)
            return void await interaction.followUp({ content: "You are not in a voice channel.", flags: "Ephemeral" });
        const botVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
        if (botVoiceChannelId && member.voice.channelId !== botVoiceChannelId)
            return void await interaction.followUp({ content: "You are not in my voice channel.", flags: "Ephemeral" });
        const queue = useQueue(interaction.guildId);
        if (!queue)
            return void await interaction.followUp({ content: "There is no queue in this server.", flags: "Ephemeral" });
        const tracks = queue.tracks.toArray();
        const pageSize = 10;
        let page = 0;
        const totalPages = Math.ceil(tracks.length / pageSize) || 1;
        const buildEmbed = (pageIndex) => {
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const queuePage = tracks.slice(start, end)
                .map((song, i) => `\`${start + i + 1}.\` [${song.cleanTitle}](${song.url}) \`[${song.duration}]\` - ${song.requestedBy.displayName}`)
                .join("\n");
            return new EmbedBuilder()
                .setColor(0x1db954)
                .setTitle("🎶 Current Queue")
                .setThumbnail(queue.currentTrack.thumbnail)
                .setDescription(`**▶️ Current Song:**\n[${queue.currentTrack.cleanTitle}] \`[${queue.currentTrack.duration}]\`\n` +
                `Requested by: **${queue.currentTrack.requestedBy.displayName}**\n\n` +
                (queuePage.length > 0 ? `**📜 Queue List:**\n${queuePage}` : `✅ Queue is empty.`))
                .setFooter({ text: `Page ${pageIndex + 1}/${totalPages} • ${queue.getSize()} total song${queue.getSize() !== 1 ? "s" : ""}` });
        };
        const buildButtons = (pageIndex, collectorActive = true) => new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId("queue_prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === 0), new ButtonBuilder()
            .setCustomId("queue_next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === totalPages - 1));
        const msg = await interaction.followUp({ embeds: [buildEmbed(page)], components: [buildButtons(page)] });
        const collector = msg.createMessageComponentCollector({ time: 60_000, filter: i => i.user.id === interaction.user.id });
        collector.on("collect", async (btnInt) => {
            if (!btnInt.deferred && !btnInt.replied)
                await btnInt.deferUpdate();
            if (btnInt.customId === "queue_prev" && page > 0)
                page--;
            else if (btnInt.customId === "queue_next" && page < totalPages - 1)
                page++;
            else
                return;
            await btnInt.editReply({ embeds: [buildEmbed(page)], components: [buildButtons(page)] });
        });
        collector.on("end", async () => {
            try {
                const fetchedMsg = await interaction.channel?.messages.fetch(msg.id);
                if (fetchedMsg)
                    await fetchedMsg.edit({ components: [buildButtons(page, false)] });
            }
            catch (error) {
                console.error("Error disabling queue button: ", error);
            }
        });
    }
}
