const Channel = require("../models/Channel");
const { Sequelize } = require("sequelize");

exports.getLanguages = async (req, res) => {

    const languages = await Channel.findAll({

        attributes: [
            [
                Sequelize.fn(
                    "DISTINCT",
                    Sequelize.col("language")
                ),
                "language"
            ]
        ],

        raw: true

    });

    res.json(
        languages
            .map(item => item.language)
            .filter(Boolean)
            .sort()
    );

};