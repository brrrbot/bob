import { BaseExtractor, GuildQueueHistory, Playlist, Track, Util } from "discord-player";
import type { ExtractorInfo, ExtractorSearchContext, ExtractorStreamable, SearchQueryType } from "discord-player";
import { Innertube, YTNodes, YT } from "youtubei.js/agnostic";
import { getInnertube } from "./getInnertube.js";
import { createSabrStream } from "./createSabr.js";
import { Readable } from "node:stream";

export class YoutubeSabrExtractor extends BaseExtractor {
    public static identifier: string = "com.brrrbot.discord-player.youtube-sabr";

    private innertube: Innertube;
    private _stream: Function;

    async activate(): Promise<void> {
        this.protocols = ["youtube", "yt"];
        this.innertube = await getInnertube();

        const fn = (this.options as any).createStream;
        if (typeof fn === "function") this._stream = (q) => { return fn(this, q) };
    }

    async deactivate(): Promise<void> {
        this._stream = null;
        this.innertube = null;
    }

    async validate(query: string, type?: SearchQueryType | null): Promise<boolean> {
        if (typeof query !== "string") return false;
        return true;
    }

    async handle(query: string, context: ExtractorSearchContext): Promise<ExtractorInfo> {
        if (!isUrl(query)) {
            let topResults: any[];
            let results: YT.Search;
            let trackResponse: Track[] = new Array<Track>;

            try {
                results = await searchYoutubeByQueryName(this.innertube, query);

                topResults = results.results.filter((video: YTNodes.Video) => video.video_id !== undefined).slice(0, 3);
                for (const r of topResults) {
                    let videoId: string = r.video_id;

                    const info = await this.innertube.getBasicInfo(videoId);
                    let durationMs: number = (info.basic_info?.duration ?? 0) * 1000;

                    let trackObj: Track = new Track(this.context.player, {
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
            } catch (error) {
                console.error(`[Youtube Extractor Error] Error while searching by name: ${error}`);
                return this.createResponse(null, []);
            }
        }

        try {
            let isPlaylist: boolean = false;
            let playlistId: string | null = null;

            try {
                const urlObj = new URL(query);
                const hasList: boolean = urlObj.searchParams.has("list");
                const isShortLink: boolean = /(^|\.)youtu\.be$/i.test(urlObj.hostname);

                isPlaylist = hasList && !isShortLink;
                playlistId = isPlaylist ? urlObj.searchParams.get("list") : null;
            } catch {
                const m = query.match(/[?&]list=([a-zA-Z0-9_-]+)/);
                isPlaylist = !!m;
                playlistId = m?.[1] ?? null;
            }

            if (isPlaylist && playlistId) {
                let playlist = await this.innertube.getPlaylist(playlistId);
                if (!playlist?.videos?.length) return this.createResponse(null, []);

                const dpPlaylist = new Playlist(this.context.player, {
                    id: playlistId,
                    title: playlist.info.title ?? "UNKNOWN TITLE",
                    url: query,
                    thumbnail: playlist.info.thumbnails[0]?.url ?? null,
                    description: playlist.info.description ?? "UNKNOWN DESCRIPTION",
                    source: "youtube",
                    type: "playlist",
                    author: {
                        name:
                            playlist?.channels[0]?.author?.name ??
                            playlist.info.author.name ??
                            "UNKNOWN AUTHOR",
                        url:
                            playlist?.channels[0]?.author?.url ??
                            playlist.info.author.url ??
                            "UNKNOWN AUTHOR",
                    },
                    tracks: [],
                });

                dpPlaylist.tracks = [];

                const playlistTracks = (
                    playlist.videos.filter((v) => v.type === "PlaylistVideo")
                ).map((v: YTNodes.PlaylistVideo) => {
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
                        async requestMetadata() { return this.raw },
                        metadata: raw,
                        live: v.is_live,
                    });
                });

                while (playlist.has_continuation) {
                    playlist = await playlist.getContinuation();

                    playlistTracks.push(...(
                        playlist.videos.filter((v) => v.type === "PlaylistVideo")).map((v: YTNodes.PlaylistVideo) => {
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
                                async requestMetadata() { return this.raw },
                                metadata: raw,
                                live: v.is_live,
                            });
                        }),
                    );
                }

                dpPlaylist.tracks = playlistTracks;

                return this.createResponse(dpPlaylist, playlistTracks);
            }

            const videoId: string = extractVideoId(query);
            if (!videoId) return this.createResponse(null, []);

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
        } catch (error) {
            console.error(`[YoutubeExtractor Error]: ${error}`);
            return this.createResponse(null, []);
        }
    }

    async stream(track: Track): Promise<ExtractorStreamable> {
        try {
            if (!this.innertube) throw new Error("Innertube not initialized.");

            const videoId = extractVideoId(track.url || track.raw?.id || "");
            if (!videoId) throw new Error("Unable to extract videoId.");

            const nodeStream: Readable = await createSabrStream(videoId);

            return nodeStream;
        } catch (error) {
            console.error(`[Youtube Extractor Error] Error while creating stream: ${error}`);
        }
    }

    // async getRelatedTracks(track: Track, history: GuildQueueHistory): Promise<ExtractorInfo> {
    //     if (!this.innertube) throw new Error("Innertube not initialized.");

    //     const seedUrl = track.url || track.raw?.id || "";
    //     let videoId = extractVideoId(seedUrl);
    //     console.log("videoid: ", videoId); // debugging line
    //     if (!videoId) throw new Error("[Youtube Extractor Error] Error at getRelatedTracks(): Unable to extract videoId");

    //     const info: YT.VideoInfo = await this.innertube.getInfo(videoId);
    //     console.log("videoinfo; ", info); // debugging line

    //     const collectFromFeed = (feed: any): any[] => {
    //         try {
    //             if (Array.isArray(feed)) return feed;
    //             if (Array.isArray(feed?.contents)) return feed.contents;
    //         } finally {
    //             // nothing to do
    //         }
    //         return [];
    //     }
    //     let feedItem: any[] = collectFromFeed(info.watch_next_feed);

    //     try {
    //         if (info.wn_has_continuation && feedItem.length < 5) {
    //             await info.getWatchNextContinuation();
    //             feedItem = feedItem.concat(collectFromFeed(info.watch_next_feed));
    //         }
    //     } finally {
    //         // nothing to do
    //     }
    //     console.log("feeditem: ", feedItem); // debugging line

    //     let recommended: YTNodes.LockupView[] = (
    //         feedItem as unknown as YTNodes.LockupView[]
    //     ).filter(
    //         (v) => v?.content_type === "VIDEO" && !history.tracks.some((x) => x.url === `https://youtube.com/watch?v=${v?.content_id}`)
    //     );

    //     // Fallback: if nothing from watch next, try a lightweight search using title/author
    //     if (!recommended || recommended.length === 0) {
    //         try {
    //             const title = track?.title ?? "";
    //             const author = track?.author ?? track?.raw?.author ?? "";

    //             const query = [author, title].filter(Boolean).join(" - ") || title || author;
    //             const results = await searchYoutubeByQueryName(this.innertube, query);

    //             const fromSearch = (results?.results ?? []).filter(
    //                 (v: any): v is YTNodes.Video =>
    //                     v?.type === "Video" &&
    //                     !!v?.video_id &&
    //                     !history.tracks.some(
    //                         (x) => x.url === `https://www.youtube.com/watch?v=${v.video_id}`
    //                     )
    //             );
    //             recommended = fromSearch;
    //         } finally {
    //             // nothing to do
    //         }
    //     }
    //     console.log("recommended: ", recommended); // debugging line

    //     if (!recommended || recommended.length === 0) {
    //         console.log("Unable to fetch recommendations.")
    //         return this.createResponse(null, []);
    //     }

    //     const seenIds = new Set<string>();
    //     const trackConstruct: Track[] = [];

    //     for (const v of recommended) {
    //         const id = (v as any)?.video_id || (v as any)?.id || (v as any)?.content_id;

    //         if (!id || seenIds.has(id)) continue;
    //         seenIds.add(id);

    //         console.log("constructing tracks..."); // debugging line
    //         const info = await this.innertube.getBasicInfo(id);
    //         const durationMs = (info.basic_info?.duration ?? 0) * 1000;

    //         console.log("new track info: ", info); // debugging line
    //         let newTrack: Track;

    //         try {
    //             newTrack = new Track(this.context.player, {
    //                 title: info.basic_info?.title ?? "UNKNOWN TITLE",
    //                 author: info.basic_info?.author ?? "UNKNOWN AUTHOR",
    //                 thumbnail: info.basic_info?.thumbnail?.[0]?.url ?? null,
    //                 url: `https://www.youtube.com/watch?v=${videoId}`,
    //                 duration: Util.buildTimeCode(Util.parseMS(durationMs)),
    //                 source: "youtube",
    //                 requestedBy: history.previousTrack.requestedBy ?? undefined,
    //             });
    //         } catch (error) {
    //             console.error("[Youtube Extractor Error] Error constructing next relate track: ", error);
    //         }
            
    //         console.log("constructed: ", newTrack); // debugging line

    //         trackConstruct.push(newTrack);
    //     }

    //     console.log("tracks: ", trackConstruct); // debugging line
    //     return this.createResponse(null, trackConstruct);
    // }
}

function extractVideoId(vid: any): string {
    const YOUTUBE_REGEX = /^https:\/\/(www\.)?youtu(\.be\/.{11}(.+)?|be\.com\/watch\?v=.{11}(&.+)?)/;
    if (!YOUTUBE_REGEX.test(vid)) throw new Error("Invalid Youtube link.");

    let id = new URL(vid).searchParams.get("v");
    if (!id) id = vid.split("/").at(-1)?.split("?").at(0);

    return id;
}

async function searchYoutubeByQueryName(innertube: Innertube, query: string): Promise<YT.Search> {
    let search: YT.Search;
    try {
        search = await innertube.search(query);
        if (search.results.length === 0) return;
    } catch (error) {
        console.error(`[Youtube Extractor Error] Error while searching by name: ${error}`);
    }
    return search;
}

function isUrl(input: string) {
    try {
        const url = new URL(input);
        return ["http:", "https:"].includes(url.protocol);
    } catch (error) {
        return false;
    }
}