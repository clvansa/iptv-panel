const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChannelStream = sequelize.define("ChannelStream", {

    url: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    quality: {
        type: DataTypes.STRING
    },

    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    status: {
        type: DataTypes.ENUM(
            "online",
            "offline",
            "unknown"
        ),
        defaultValue: "unknown"
    }

});

module.exports = ChannelStream;