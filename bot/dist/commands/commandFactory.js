import { autoplay } from "./utils/autoplay.js";
import { loop } from "./utils/loop.js";
import { pause } from "./utils/pause.js";
import { previous } from "./utils/previous.js";
import { repeat } from "./utils/repeat.js";
import { shuffle } from "./utils/shuffle.js";
import { skip } from "./utils/skip.js";
import { stop } from "./utils/stop.js";
export class commandFactory {
    static init() {
        const buttonList = [new autoplay(), new loop(), new pause(), new previous(), new repeat(), new shuffle(), new skip(), new stop()];
        buttonList.forEach(cmd => this.buttonCommands.set(cmd.name, cmd));
    }
    static getButtonCommand(name) {
        return this.buttonCommands.get(name);
    }
}
commandFactory.buttonCommands = new Map();
