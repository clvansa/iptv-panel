const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Channel = sequelize.define("Channel", {

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    tvg_id: {
        type: DataTypes.STRING
    },

    logo: {
        type: DataTypes.TEXT
    },

    country_code: {
        type: DataTypes.STRING(10)
    },
    stream_url: {
        type: DataTypes.TEXT
    },

    language: {
        type: DataTypes.TEXT
    },

    source: {
        type: DataTypes.ENUM(
            "iptv-org",
            "manual",
            "xtream"
        ),
        defaultValue: "manual"
    },
    format: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    },

    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_checked: {
        type: DataTypes.DATE
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

module.exports = Channel;