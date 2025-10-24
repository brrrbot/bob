import dotenv from "dotenv";
import { Innertube, UniversalCache, Platform } from "youtubei.js";
Platform.shim.eval = async (data, env) => {
    const properties = [];
    if (env.n)
        properties.push(`n: exportedVars.nFunction("${env.n}")`);
    if (env.sig)
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
    const code = `${data.output}\nreturn { ${properties.join(', ')} }`;
    return new Function(code)();
};
dotenv.config();
let innertubeInstance;
export async function getInnertube() {
    if (!innertubeInstance) {
        innertubeInstance = await Innertube.create({
            cache: new UniversalCache(false),
            cookie: process.env.YOUTUBE_COOKIE ?? null,
        });
    }
    return innertubeInstance;
}
