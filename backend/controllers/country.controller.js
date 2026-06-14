const axios = require("axios");
const Channel = require("../models/Channel");
const { Sequelize } = require("sequelize");

exports.getCountries = async (req, res) => {

    try {

        const dbCountries =
            await Channel.findAll({

                attributes: [
                    [
                        Sequelize.fn(
                            "DISTINCT",
                            Sequelize.col("country_code")
                        ),
                        "country_code"
                    ]
                ],

                raw: true

            });

        const response =
            await axios.get(
                "https://iptv-org.github.io/api/countries.json"
            );

        const countries =
            response.data;

        const result =
            dbCountries
                .map(item => {

                    const country =
                        countries.find(
                            c =>
                                c.code ===
                                item.country_code
                        );

                    return {

                        code:
                            item.country_code,

                        name:
                            country?.name ||
                            item.country_code

                    };

                })
                .filter(
                    item => item.code
                )
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                );

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

