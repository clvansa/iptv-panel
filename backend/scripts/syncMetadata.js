require("dotenv").config({
    path: "../.env"
});

const axios = require("axios");
const sequelize = require("../config/database");

const Channel =
    require("../models/Channel");

(async () => {

    try {

        await sequelize.authenticate();

        const response =
            await axios.get(
                "https://iptv-org.github.io/api/feeds.json"
            );

        const metadata =
            response.data;

        console.log("Feeds Count:", metadata.length);
        console.log("First Feed Object:", metadata[0]);

        const testFeed = metadata.find(
            f => f.channel === "2MMonde.ma"
        );

        console.log("Test Feed:", testFeed);

        const metadataMap =
            new Map();

        for (const item of metadata) {

            metadataMap.set(
                item.channel,
                item
            );

        }

        const channels =
            await Channel.findAll();

        let updated = 0;

        for (const channel of channels) {

            if (!channel.tvg_id)
                continue;

            const cleanId =
                channel.tvg_id
                    .split("@")[0];

            const data =
                metadataMap.get(
                    cleanId
                );



            if (!data)
                continue;

            await channel.update({



                language:
                    data.languages?.join(",") ||
                    null,



            });

            updated++;

        }

        console.log(
            `Updated ${updated} channels`
        );

        process.exit(0);

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

})();