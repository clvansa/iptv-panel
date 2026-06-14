const Channel = require("../models/Channel");
const { Sequelize } = require("sequelize");

exports.getCategories = async (req, res) => {

    const categories = await Channel.findAll({

        attributes: [
            [
                Sequelize.fn(
                    "DISTINCT",
                    Sequelize.col("category")
                ),
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

};