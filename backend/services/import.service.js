const axios = require("axios");

const Channel = require("../models/Channel");
const parseM3u = require("../utils/parseM3u");
const { syncMetadata } = require('./syncMetadata.service')
const { syncCountries } = require('./syncCountries.service')
exports.importFromUrl = async (url) => {

    const response = await axios.get(url, {
        timeout: 30000,
        maxContentLength: 20 * 1024 * 1024,
        maxBodyLength: 20 * 1024 * 1024,
        responseType: "text"
    });

    const channels = parseM3u(response.data);

    if (!channels.length) {
        return {
            total: 0,
            inserted: 0
        };
    }

    const urls = channels.map(
        channel => channel.stream_url
    );

    const existingChannels =
        await Channel.findAll({
            attributes: ["stream_url"],
            where: {
                stream_url: urls
            }
        });

    const existingUrls = new Set(
        existingChannels.map(
            channel => channel.stream_url
        )
    );

    const newChannels =
        channels.filter(
            channel =>
                !existingUrls.has(
                    channel.stream_url
                )
        );

    if (newChannels.length) {

        const createdChannels = await Channel.bulkCreate(
            newChannels, {
            returning: true
        }
        );


        await syncMetadata(createdChannels)
        await syncCountries(createdChannels)
    }


    return {
        total: channels.length,
        inserted: newChannels.length
    };

};