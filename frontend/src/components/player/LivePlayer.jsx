import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function LivePlayer({ url, useProxy = false, channelId }) {
    const [volume, setVolume] = useState(() => {
        return Number(localStorage.getItem("playerVolume") || 1)
    })

    const streamUrl = useProxy ? `${import.meta.env.VITE_API_URL}/channels/${channelId}/stream` : url

    const videoRef = useRef(null);

    useEffect(() => {

        const video = videoRef.current;

        if (!video) return;

        video.volume = volume;

    }, [volume]);

    useEffect(() => {

        if (!url) return;

        const video = videoRef.current;

        if (Hls.isSupported()) {

            const hls = new Hls({
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
            });

            return () => {
                hls.destroy();
            };

        }

        video.src = url;

    }, [streamUrl]);

    useEffect(() => {

        const video =
            videoRef.current;

        if (!video) return;

        const handleVolumeChange =
            () => {

                localStorage.setItem(
                    "playerVolume",
                    video.volume
                );

                setVolume(
                    video.volume
                );

            };

        video.addEventListener(
            "volumechange",
            handleVolumeChange
        );

        return () => {

            video.removeEventListener(
                "volumechange",
                handleVolumeChange
            );

        };

    }, []);

    return (
        <video
            ref={videoRef}
            controls
            autoPlay
            onError={(e) => {
            }}
            style={{
                width: "100%",
                borderRadius: 12
            }}
        />
    );
}