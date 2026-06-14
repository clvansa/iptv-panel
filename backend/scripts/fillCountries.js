require("dotenv").config({
    path: "../.env"
});

const sequelize = require("../config/database");
const Channel = require("../models/Channel");

exports.fillCountries(async () => {

    try {

        await sequelize.authenticate();

        const channels = await Channel.findAll();

        let updated = 0;

        for (const channel of channels) {

            if (!channel.tvg_id)
                continue;

            const match =
                channel.tvg_id.match(/\.([a-z]{2})@/i);

            if (!match)
                continue;

            await channel.update({
                country_code: match[1].toUpperCase()
            });

            updated++;
        }

        console.log(`Updated ${updated} channels`);

        process.exit(0);

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

})();