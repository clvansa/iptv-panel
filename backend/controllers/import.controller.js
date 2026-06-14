const importService =
    require("../services/import.service");

exports.importUrl = async (
    req,
    res
) => {

    try {

        const { url } = req.body;

        if (!url) {

            return res.status(400).json({
                success: false,
                message: "URL required"
            });

        }

        const result =
            await importService
                .importFromUrl(url);


        res.json({
            success: true,
            ...result
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};