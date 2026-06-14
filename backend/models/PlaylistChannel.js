const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PlaylistChannel = sequelize.define(
    "PlaylistChannel",
    {
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }
);

module.exports = PlaylistChannel;