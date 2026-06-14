require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

require("./models");

(async () => {

    try {

        await sequelize.authenticate();

        console.log("Database Connected");

        await sequelize.sync({
            
        });

        app.listen(process.env.PORT, () => {

            console.log(
                `Server running on ${process.env.PORT}`
            );

        });

    } catch (error) {

        console.log(error);

    }

})();