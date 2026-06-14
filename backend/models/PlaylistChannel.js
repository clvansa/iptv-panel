const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PlaylistChannel = sequelize.define(
    "PlaylistChannel",
    {
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        country_code: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        favorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }
);

module.exports = PlaylistChannel;