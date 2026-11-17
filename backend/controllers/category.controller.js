const Channel = require("../models/Channel");
const { Sequelize } = require("sequelize");


exports.getCategories = async (req, res) => {
    try {
        const categories = await Channel.findAll({
            attributes: [
                [
                    Sequelize.fn("DISTINCT", Sequelize.col("category")),
                    "category"
                ]
            ],
            raw: true
        });

        res.json(
            categories
                .map(item => item.category)
                .filter(Boolean)
                .sort()
        );

    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: error.message });
    }
};
