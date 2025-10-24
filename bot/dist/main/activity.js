import { ActivityType } from "discord.js";
/**
 * Activity status rotator
 */
export class ClientActivityHandler {
    client;
    intervalId = null;
    activities = [
        "up and running ( ˶ˆᗜˆ˵ )",
        "happy with spotify access ♡⸜(˶˃ ᵕ ˂˶)⸝♡",
        "waiting for non-existent update patch",
        "fantasizing about the money earn from being a music bot (,,>ヮ<,,)!",
        "🎶🎶🎶",
        "better than matchbox",
        "better than jockie music"
    ];
    intervalTime = 5000;
    constructor(clientInstance) {
        this.client = clientInstance;
    }
    /**
     * Register status rotator to Discord client
     */
    register() {
        this.client.once("clientReady", this.onClientReady.bind(this));
    }
    onClientReady() {
        console.log(`${this.client.user?.tag} is ready!`);
        this.startActivityRotation();
    }
    startActivityRotation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => {
            const status = this.activities[Math.floor(Math.random() * this.activities.length)];
            this.client.user?.setPresence({
                activities: [{ name: status, type: ActivityType.Playing }],
                status: 'online'
            });
        }, this.intervalTime);
    }
    /**
     * Stop status rotation
     */
    stopActivityRotation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log(`Activity rotation stopped for ${this.client.user?.tag}`);
        }
    }
}
