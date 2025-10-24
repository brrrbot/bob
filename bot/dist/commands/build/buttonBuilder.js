import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
/**
 * Create action buttons
 * @returns Array of action buttions
 */
export function buttons() {
    const playerButtons = new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('⏮️ Prev')
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId('pause')
        .setLabel('⏯ Pause/Play')
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId('skip')
        .setLabel('⏭️ Next')
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('⛔ Stop')
        .setStyle(ButtonStyle.Danger));
    const playerButtons2 = new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId('repeat')
        .setLabel('🔂 Loop Song')
        .setStyle(ButtonStyle.Success), new ButtonBuilder()
        .setCustomId('loop')
        .setLabel('🔁 Loop Queue')
        .setStyle(ButtonStyle.Success), new ButtonBuilder()
        .setCustomId('shuffle')
        .setLabel('🔀 Shuffle')
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId('autoplay')
        .setLabel('▶️ AutoPlay')
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId('queue')
        .setLabel('📄 Queue')
        .setStyle(ButtonStyle.Secondary));
    return [playerButtons, playerButtons2];
}
