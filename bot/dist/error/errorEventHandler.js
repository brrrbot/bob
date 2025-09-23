export class PlayerEventHandler {
    constructor(player) {
        this.player = player;
    }
    ;
    register() {
        this.player.events.on("error", this.onError);
        this.player.events.on("playerError", this.onPlayerError);
        process.on("unhandledRejection", this.onUnhandledRejection);
        process.on("uncaughtException", this.onUncaughtException);
    }
    onError(queue, error) {
        console.error(`[Error] Queue: ${queue.guild.name} | ${error.message}`);
        if (queue.tracks.size > 0)
            queue.node.skip();
        else if (!queue.deleted)
            queue.delete();
    }
    onPlayerError(queue, error) {
        console.error(`[Error] Guild: ${queue.guild.name} | ${error.message}`);
        if (queue.tracks.size > 0)
            queue.node.skip();
        else if (!queue.deleted)
            queue.delete();
    }
    onUnhandledRejection(reason, promise) {
        console.error(`[Unhandled Rejection]`, reason, promise);
    }
    onUncaughtException(error) {
        console.error(`[Uncaught Exception]`, error);
    }
}
