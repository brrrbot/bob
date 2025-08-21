import { Player } from "discord-player";

/**
 * Attaches error handling to a Discord Player instance
 * @param player - The Discord Player instance
 */
export function handleError(player: Player) {
    // Queue-level errors
    player.events.on("error", (queue, error: Error) => {
        try {
            console.error(`[Error] Queue: ${queue.guild.name} | ${error.message}`);
            if (queue) {
                if (queue.tracks.toArray().length > 0) {
                    console.log(`[Action] Attempting to play the next song in queue...`);
                    queue.node.skip();
                } else {
                    console.log(`[Action] No more tracks in queue. Destroying the queue...`);
                    if (!queue.deleted) queue.delete();
                }
            }
        } catch (error: any) {
            console.error(`[Unhandled Error] ${error.message}`);
        }
    });

    // Player-level errors
    player.events.on("playerError", (queue, error: Error) => {
        try {
            console.error(`[Player Error] Guild: ${queue.guild.name} | Error: ${error.message}`);
            if (queue) {
                if (queue.tracks.toArray().length > 0) {
                    console.log(`[Action] Attempting to play the next track after player error...`);
                    queue.node.skip();
                } else {
                    console.log(`[Action] No more tracks. Stopping and leaving the channel...`);
                    if (!queue.deleted) queue.delete();
                }
            }
        } catch (error: any) {
            console.error(`[Unhandled Player Error] ${error.message}`);
        }
    });

    // Prevent crashes from unhandled promises
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
        console.error(`[Unhandled Rejection] Promise: ${promise}, Reason: ${reason}`);
    });

    // Prevent crashes from uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
        console.error(`[Uncaught Exception] ${error.message}`);
    });
}
