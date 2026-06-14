const Channel = require("../models/Channel");

exports.generateM3u = async (filters = {}) => {

    const channels = await Channel.findAll({
        where: filters,
        order: [
            ["name", "ASC"]
        ]
    });

    let content = "#EXTM3U\n\n";

    for (const channel of channels) {

        content +=
`#EXTINF:-1 tvg-id="${channel.tvg_id || ""}" tvg-logo="${channel.logo || ""}" group-title="${channel.category || ""}",${channel.name}
${channel.stream_url}

`;

    }

    return content;

};