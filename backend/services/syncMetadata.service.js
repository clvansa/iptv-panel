const axios = require('axios');
const Channel = require("../models/Channel");


exports.syncMetadata = async (channels) => {

    const response =
        await axios.get(
            "https://iptv-org.github.io/api/feeds.json"
        );

    const metadataMap =
        new Map();

    response.data.forEach(item => {

        metadataMap.set(
            item.channel,
            item
        );

    });

    let updated = 0;

    for (const channel of channels) {

        if (!channel.tvg_id)
            continue;

        const cleanId =
            channel.tvg_id.split("@")[0];

        const data =
            metadataMap.get(
                cleanId
            );

        if (!data)
            continue;

        await Channel.update(
            {
                language:
                    data.languages?.join(",")
                    || null
            },
            {
                where: {
                    stream_url:
                        channel.stream_url
                }
            }
        );

        updated++;

    }

    return updated;

};