const Channel = require("../models/Channel");

exports.syncCountries = async (channels) => {
    
      let updated = 0;

    for (const channel of channels) {

        if (!channel.tvg_id)
            continue;

        const match =
            channel.tvg_id.match(
                /\.([a-z]{2})@/i
            );

        if (!match)
            continue;

        await Channel.update(
            {
                country_code:
                    match[1].toUpperCase()
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