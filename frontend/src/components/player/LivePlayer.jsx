
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function LivePlayer({
    url,
    useProxy = false,
    channelId
}) {
    const [volume, setVolume] = useState(() => {
        return Number(localStorage.getItem("playerVolume") ?? 1);
    });

    const videoRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const streamUrl = useProxy
        ? `${apiUrl}/channels/${channelId}/stream`
        : url;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.volume = volume;
    }, [volume]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !streamUrl) return;

        let hls;

        // HLS.js supported
        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS Error:", data);

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;

                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;

                        default:
                            hls.destroy();
                            break;
                    }
                }
            });
        }

        // Native HLS fallback (Safari)
        else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;

            video.play().catch(() => {});
        }

        else {
            console.error("HLS is not supported by this browser");
        }

        return () => {
            if (hls) {
                hls.destroy();
            }

            video.removeAttribute("src");
            video.load();
        };

    }, [streamUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleVolumeChange = () => {
            localStorage.setItem("playerVolume", String(video.volume));
            setVolume(video.volume);
        };

        video.addEventListener("volumechange", handleVolumeChange);

        return () => {
            video.removeEventListener("volumechange", handleVolumeChange);
        };
    }, []);

    return (
        <video
            ref={videoRef}
            controls
            autoPlay
            onError={(e) => {
                console.error("Video Error:", e.currentTarget.error);
            }}
            style={{
                width: "100%",
                borderRadius: 12
            }}
        />
    );
}
