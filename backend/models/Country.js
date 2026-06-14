const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Country = sequelize.define("Country", {

    code: {
        type: DataTypes.STRING(10),
        unique: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

module.exports = Country;