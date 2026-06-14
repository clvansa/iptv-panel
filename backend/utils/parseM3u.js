module.exports = (content) => {

    const lines = content.split("\n");

    const channels = [];

    for (let i = 0; i < lines.length; i++) {

        const line = lines[i].trim();

        if (!line.startsWith("#EXTINF"))
            continue;

        const streamUrl = lines[i + 1]?.trim();

        if (!streamUrl || !streamUrl.startsWith("http"))
            continue;

        const name =
            line.split(",").pop()?.trim() || null;

        const tvgId =
            line.match(/tvg-id="([^"]+)"/)?.[1] || null;

        const logo =
            line.match(/tvg-logo="([^"]+)"/)?.[1] || null;

        const category =
            line.match(/group-title="([^"]+)"/)?.[1] || null;

        channels.push({
            name,
            tvg_id: tvgId,
            logo,
            category,
            stream_url: streamUrl,
            source: "iptv-org"
        });

    }

    return channels;

};