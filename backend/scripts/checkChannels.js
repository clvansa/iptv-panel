// scripts/updateChannelStatus.js
require("dotenv").config();
const axios = require("axios");
const { Channel } = require("../models");

async function checkStream(url) {

    try {

        const response = await axios.get(url, {
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: () => true
        });

        return response.status >= 200 &&
               response.status < 400;

    } catch {

        return false;

    }

}

(async () => {

    const channels =
        await Channel.findAll();

    console.log(
        `Checking ${channels.length} channels`
    );

    for (const channel of channels) {

        const online =
            await checkStream(
                channel.stream_url
            );

        await channel.update({

            status:
                online
                    ? "online"
                    : "offline",

            last_checked:
                new Date()

        });

        console.log(
            `${channel.name} -> ${
                online
                    ? "online"
                    : "offline"
            }`
        );

    }

    console.log("Finished");

    process.exit();

})();