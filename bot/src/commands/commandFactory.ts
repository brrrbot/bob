import { buttonCommand } from "./commands.js";
import { autoplay } from "./utils/autoplay.js";
import { loop } from "./utils/loop.js";
import { pause } from "./utils/pause.js";
import { previous } from "./utils/previous.js";
import { repeat } from "./utils/repeat.js";
import { shuffle } from "./utils/shuffle.js";
import { skip } from "./utils/skip.js";
import { stop } from "./utils/stop.js";

export class commandFactory {
    private static buttonCommands: Map<string, buttonCommand> = new Map();

    static init() {
        const buttonList: buttonCommand[] = [new autoplay(), new loop(), new pause(), new previous(), new repeat(), new shuffle(), new skip(), new stop()];

        buttonList.forEach(cmd => this.buttonCommands.set(cmd.name, cmd));
    }

    static getButtonCommand(name: string): buttonCommand | undefined {
        return this.buttonCommands.get(name);
    }
}