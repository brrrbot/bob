import { BaseExtractor, Playlist, Track, Util } from "discord-player";
import { getInnertube } from "./getInnertube.js";
import { createSabrStream } from "./createSabr.js";
export class YoutubeSabrExtractor extends BaseExtractor {
    static identifier = "com.brrrbot.discord-player.youtube-sabr";
    innertube;
    _stream;
    async activate() {
        this.protocols = ["youtube", "yt"];
        this.innertube = await getInnertube();
        const fn = this.options.createStream;
        if (typeof fn === "function")
            this._stream = (q) => { return fn(this, q); };
    }
    async deactivate() {
        this._stream = null;
        this.innertube = null;
    }
    async validate(query, type) {
        if (typeof query !== "string")
            return false;
        return true;
    }
    async handle(query, context) {
        if (!checkIsUrl(query)) {
            let topResults;
            let results;
            let trackResponse = new Array;
            try {
                results = await searchYoutubeByQueryName(this.innertube, query);
                topResults = results.results.filter((video) => video.video_id !== undefined).slice(0, 3);
                for (const r of topResults) {
                    let videoId = r.video_id;
                    const info = await this.innertube.getBasicInfo(videoId);
                    let durationMs = (info.basic_info?.duration ?? 0) * 1000;
                    let trackObj = new Track(this.context.player, {
                        title: info.basic_info?.title ?? "UNKNOWN TITLE",
                        author: info.basic_info?.author ?? "UNKNOWN AUTHOR",
                        thumbnail: info.basic_info?.thumbnail?.[0]?.url ?? null,
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                        duration: Util.buildTimeCode(Util.parseMS(durationMs)),
                        source: "youtube",
                        requestedBy: context.requestedBy ?? null,
                        raw: {
                            basicInfo: info,
                            live: info.basic_info?.is_live || false,
                        },
                    });
                    trackResponse.push(trackObj);
                }
                return this.createResponse(null, trackResponse);
            }
            catch (error) {
                console.error(`[Youtube Extractor Error] Error while searching by name: ${error}`);
                return this.createResponse(null, []);
            }
        }
        try {
            let isPlaylist = false;
            let playlistId = null;
            try {
                const urlObj = new URL(query);
                const hasList = urlObj.searchParams.has("list");
                const isShortLink = /(^|\.)youtu\.be$/i.test(urlObj.hostname);
                isPlaylist = hasList && !isShortLink;
                playlistId = isPlaylist ? urlObj.searchParams.get("list") : null;
            }
            catch {
                const m = query.match(/[?&]list=([a-zA-Z0-9_-]+)/);
                isPlaylist = !!m;
                playlistId = m?.[1] ?? null;
            }
            if (isPlaylist && playlistId) {
                let playlist = await this.innertube.getPlaylist(playlistId);
                if (!playlist?.videos?.length)
                    return this.createResponse(null, []);
                const dpPlaylist = new Playlist(this.context.player, {
                    id: playlistId,
                    title: playlist.info.title ?? "UNKNOWN TITLE",
                    url: query,
                    thumbnail: playlist.info.thumbnails[0]?.url ?? null,
                    description: playlist.info.description ?? "UNKNOWN DESCRIPTION",
                    source: "youtube",
                    type: "playlist",
                    author: {
                        name: playlist?.channels[0]?.author?.name ??
                            playlist.info.author.name ??
                            "UNKNOWN AUTHOR",
                        url: playlist?.channels[0]?.author?.url ??
                            playlist.info.author.url ??
                            "UNKNOWN AUTHOR",
                    },
                    tracks: [],
                });
                dpPlaylist.tracks = [];
                const playlistTracks = (playlist.videos.filter((v) => v.type === "PlaylistVideo")).map((v) => {
                    const duration = Util.buildTimeCode(Util.parseMS(v.duration.seconds * 1000));
                    const raw = {
                        duration_ms: v.duration.seconds * 1000,
                        live: v.is_live,
                        duration,
                    };
                    return new Track(this.context.player, {
                        title: v.title.text ?? "UNKNOWN TITLE",
                        duration: duration,
                        thumbnail: v.thumbnails[0]?.url ?? null,
                        author: v.author.name,
                        requestedBy: context.requestedBy,
                        url: `https://youtube.com/watch?v=${v.id}`,
                        raw,
                        playlist: dpPlaylist,
                        source: "youtube",
                        queryType: "youtubeVideo",
                        async requestMetadata() { return this.raw; },
                        metadata: raw,
                        live: v.is_live,
                    });
                });
                while (playlist.has_continuation) {
                    playlist = await playlist.getContinuation();
                    playlistTracks.push(...(playlist.videos.filter((v) => v.type === "PlaylistVideo")).map((v) => {
                        const duration = Util.buildTimeCode(Util.parseMS(v.duration.seconds * 1000));
                        const raw = {
                            duration_ms: v.duration.seconds * 1000,
                            live: v.is_live,
                            duration,
                        };
                        return new Track(this.context.player, {
                            title: v.title.text ?? "UNKNOWN TITLE",
                            duration,
                            thumbnail: v.thumbnails[0]?.url ?? null,
                            author: v.author.name,
                            requestedBy: context.requestedBy,
                            url: `https://youtube.com/watch?v=${v.id}`,
                            raw,
                            playlist: dpPlaylist,
                            source: "youtube",
                            queryType: "youtubeVideo",
                            async requestMetadata() { return this.raw; },
                            metadata: raw,
                            live: v.is_live,
                        });
                    }));
                }
                dpPlaylist.tracks = playlistTracks;
                return this.createResponse(dpPlaylist, playlistTracks);
            }
            const videoId = extractVideoId(query);
            if (!videoId)
                return this.createResponse(null, []);
            const info = await this.innertube.getBasicInfo(videoId);
            const durationMs = (info.basic_info?.duration ?? 0) * 1000;
            const trackObj = new Track(this.context.player, {
                title: info.basic_info?.title ?? "UNKNOWN TITLE",
                author: info.basic_info?.author ?? "UNKNOWN AUTHOR",
                thumbnail: info.basic_info?.thumbnail?.[0]?.url ?? null,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                duration: Util.buildTimeCode(Util.parseMS(durationMs)),
                source: "youtube",
                requestedBy: context.requestedBy ?? null,
                raw: {
                    basicInfo: info,
                    live: info.basic_info?.is_live || false,
                },
            });
            return this.createResponse(null, [trackObj]);
        }
        catch (error) {
            console.error(`[YoutubeiExtractor Error]: ${error}`);
            return this.createResponse(null, []);
        }
    }
    async stream(track) {
        try {
            if (!this.innertube)
                throw new Error("Innertube not initialized.");
            const videoId = extractVideoId(track.url || track.raw?.id || "");
            if (!videoId)
                throw new Error("Unable to extract videoId.");
            const nodeStream = await createSabrStream(videoId);
            return nodeStream;
        }
        catch (error) {
            console.error(`[Youtubei Extractor Error] Error while creating stream: ${error}`);
        }
    }
    async getRelatedTracks(track, history) {
        let videoId = extractVideoId(track);
        if (!videoId)
            throw new Error("[YoutubeiExtractor Error] Error at getRelatedTracks(): Unable to extract videoId.");
        const info = await this.innertube.getInfo(videoId);
        const next = info.watch_next_feed;
        const recommended = next.filter((v) => !history.tracks.some((x) => x.url === `https://youtube.com/watch?v=${v.id}`) && v.type === "CompactVideo");
        if (!recommended) {
            this.context.player.debug("Unable to fetch recommendations.");
            return this.createResponse(null, []);
        }
        const trackConstruct = recommended.map((v) => {
            const duration = Util.buildTimeCode(Util.parseMS(v.duration.seconds * 1000));
            const raw = {
                live: v.is_live,
                duration_ms: v.duration.seconds * 1000,
                duration,
            };
            return new Track(this.context.player, {
                title: v.title?.text ?? "UNKNOWN TITLE",
                thumbnail: v.best_thumbnail?.url ?? v.thumbnails[0].url,
                author: v.author?.name ?? "UNKNOWN AUTHOR",
                requestedBy: track.requestedBy ?? null,
                url: `https://youtube.com/watch?v=${v.video_id}`,
                source: "youtube",
                duration,
                raw,
            });
        });
        return this.createResponse(null, trackConstruct);
    }
}
function extractVideoId(vid) {
    const YOUTUBE_REGEX = /^https:\/\/(www\.)?youtu(\.be\/.{11}(.+)?|be\.com\/watch\?v=.{11}(&.+)?)/;
    if (!YOUTUBE_REGEX.test(vid))
        throw new Error("Invalid Youtube link.");
    let id = new URL(vid).searchParams.get("v");
    if (!id)
        id = vid.split("/").at(-1)?.split("?").at(0);
    return id;
}
async function searchYoutubeByQueryName(innertube, query) {
    let search;
    try {
        search = await innertube.search(query);
        if (search.results.length === 0)
            return;
    }
    catch (error) {
        console.error(`[Youtube Extractor Error] Error while searching by name: ${error}`);
    }
    return search;
}
function checkIsUrl(query) {
    let isUrl;
    try {
        new URL(query);
        isUrl = true;
    }
    catch (error) {
        isUrl = false;
    }
    return isUrl || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(query);
}
