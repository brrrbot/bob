import { EmbedBuilder } from "discord.js";
import { buttons } from "../commands/build/buttonBuilder.js";
import botcolors from "../commands/build/botDeco.json" with { type: "json" };
import colorsJson from "../commands/build/colors.json" with { type: "json" };
const botDeco = botcolors;
const colors = colorsJson;
/**
 * Class to handle events on player start
 */
export class MusicEventHandler {
    player;
    constructor(playerInstance) {
        this.player = playerInstance;
    }
    /**
     * Register player start event handler
     */
    register() {
        this.player.events.on("playerStart", this.onPlayerStart.bind(this));
    }
    async onPlayerStart(queue, track) {
        const channel = queue.metadata;
        if (!channel) {
            console.error("Channel not found!");
            return;
        }
        const botId = this.player.client.user?.id;
        const botColor = botId && botDeco[botId] ? botDeco[botId].color : colors.default;
        const botThumbnail = botId && botDeco[botId] ? botDeco[botId].thumbnail : this.player.client.user?.avatarURL();
        let embed = new EmbedBuilder()
            .setColor(botColor)
            .setAuthor({
            name: 'Now Playing 🎶',
            iconURL: track.thumbnail
        })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail(botThumbnail)
            .addFields({ name: 'Duration', value: track.duration, inline: true }, { name: 'Requested by', value: track.requestedBy?.username || 'Unknown', inline: true })
            .setFooter({
            text: 'Enjoy your music!',
            iconURL: 'https://cdn-icons-png.flaticon.com/128/9280/9280598.png'
        });
        try {
            await queue.metadata.send({ embeds: [embed], components: buttons() });
        }
        catch (error) {
            console.error("Error sending playerStart embed: ", error);
        }
    }
}
