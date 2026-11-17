const importService = require("../services/import.service");

exports.importUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (typeof url !== "string" || !url.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid URL required"
            });
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL"
            });
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                success: false,
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }

        const result = await importService.importFromUrl(url);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Import Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
