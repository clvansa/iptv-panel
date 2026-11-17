const Channel = require("../models/Channel");
const { Sequelize } = require("sequelize");


exports.getLanguages = async (req, res) => {
    try {
        const languages = await Channel.findAll({
            attributes: [
                [
                    Sequelize.fn("DISTINCT", Sequelize.col("language")),
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

    } catch (error) {
        console.error("Get Languages Error:", error);
        res.status(500).json({ message: error.message });
    }
};
