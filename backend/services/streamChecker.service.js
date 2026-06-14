const axios = require("axios");

exports.checkStream = async (url) => {

    try {

        const response = await axios.get(url, {
            timeout: 10000,
            maxRedirects: 5,
            responseType: "text"
        });

        const data = String(response.data);

        if (
            data.includes("#EXTM3U") ||
            data.includes("#EXTINF") ||
            data.includes("#EXT-X-TARGETDURATION")
        ) {

            return true;

        }

        return response.status === 200;

    } catch {

        return false;

    }

};