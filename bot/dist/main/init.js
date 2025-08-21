import { Client, GatewayIntentBits } from "discord.js";
import { initPlayer, registerExtractors } from "../audio/registerExtractors.js";
import { activity } from "./activity.js";
import { handleInteraction } from "../controller/interaction.js";
import { handleError } from "../error/errorhandling.js";
import { playerStart } from "../commands/build/embedBuilder.js";
export function createClient() {
    // Create Client
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });
    // Add Activities Status
    activity(client);
    // Create Player
    const player = initPlayer(client);
    // Register Extractor
    registerExtractors(player);
    // Interaction Handler
    handleInteraction(client, player);
    // Error Handler for Player
    handleError(player);
    // Player Event Handler
    playerStart(player);
    return client;
}
