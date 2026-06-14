const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Playlist = sequelize.define("Playlist", {

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT
    },
    country_order: {
        type: DataTypes.JSON,
        allowNull: true
    },

});

module.exports = Playlist;