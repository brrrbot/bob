/**
 * Rotating activity status for discord bot
 */
export function activity(client) {
    client.once("ready", () => {
        console.log(`${client.user?.tag} has logged in!`);
        const activities = [
            "up and running ( ˶ˆᗜˆ˵ )",
            "happy with spotify access ♡⸜(˶˃ ᵕ ˂˶)⸝♡",
            "waiting for non-existent update patch",
            "fantasizing about the money earn from being a music bot (,,>ヮ<,,)!",
            "🎶🎶🎶",
            "better than matchbox",
            "better than jockie music"
        ];
        setInterval(() => {
            const status = activities[Math.floor(Math.random() * activities.length)];
            client.user?.setPresence({ activities: [{ name: `${status}` }] });
        }, 5000);
    });
}
