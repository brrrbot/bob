import { Client, ActivityType } from "discord.js";
import type { PresenceStatusData } from "discord.js";

/**
 * Activity status rotator
 */
export class ClientActivityHandler {
    private client: Client;
    private intervalId: NodeJS.Timeout | null = null;
    private activities: string[] = [
        "up and running ( ˶ˆᗜˆ˵ )",
        "happy with spotify access ♡⸜(˶˃ ᵕ ˂˶)⸝♡",
        "waiting for non-existent update patch",
        "fantasizing about the money earn from being a music bot (,,>ヮ<,,)!",
        "🎶🎶🎶",
        "better than matchbox",
        "better than jockie music"
    ];
    private intervalTime: number = 5000; 

    constructor(clientInstance: Client) {
        this.client = clientInstance;
    }

    /**
     * Register status rotator to Discord client
     */
    public register() {
        this.client.once("clientReady", this.onClientReady.bind(this));
    }

    private onClientReady() {
        console.log(`${this.client.user?.tag} is ready!`);

        this.startActivityRotation();
    }

    private startActivityRotation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            const status = this.activities[Math.floor(Math.random() * this.activities.length)];
            this.client.user?.setPresence({
                activities: [{ name: status, type: ActivityType.Playing }],
                status: 'online' as PresenceStatusData
            });
        }, this.intervalTime);
    }

    /**
     * Stop status rotation
     */
    public stopActivityRotation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log(`Activity rotation stopped for ${this.client.user?.tag}`);
        }
    }
}