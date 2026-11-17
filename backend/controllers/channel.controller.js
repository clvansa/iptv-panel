const { Op } = require("sequelize");
const Channel = require("../models/Channel");
const { checkStream } = require("../services/streamChecker.service");
const axios = require('axios');

// 1. جلب القنوات مع التصفية والتقسيم لصفحات (Pagination)
exports.getChannels = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const where = {};

        if (req.query.country) {
            where.country_code = req.query.country.toUpperCase();
        }

        if (req.query.language) {
            where.language = req.query.language;
        }

        if (req.query.category) {
            where.category = req.query.category;
        }

        if (req.query.search) {
            where.name = {
                [Op.like]: `%${req.query.search}%`
            };
        }

        const result = await Channel.findAndCountAll({
            where,
            limit,
            offset,
            order: [["id", "DESC"]]
        });

        res.json({
            total: result.count,
            page,
            pages: Math.ceil(result.count / limit),
            channels: result.rows
        });

    } catch (error) {
        console.error("Get Channels Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. فحص حالة القناة وتحديثها في قاعدة البيانات
exports.checkChannel = async (req, res) => {
    try {
        const channel = await Channel.findByPk(req.params.id);

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        const online = await checkStream(channel.stream_url);

        await channel.update({
            status: online ? "online" : "offline",
            last_checked: new Date()
        });

        res.json({
            success: true,
            status: online ? "online" : "offline"
        });

    } catch (error) {
        console.error("Check Channel Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. عمل بروكلي لملف البث وإعادة كتابة الروابط الداخلية (URI)
exports.proxyStream = async (req, res) => {
    try {
        const channel = await Channel.findByPk(req.params.id);

        if (!channel) {
            return res.status(404).json({
                message: "Channel not found"
            });
        }

        const apiBase = process.env.PUBLIC_API_URL;

        if (!apiBase) {
            throw new Error("PUBLIC_API_URL is not configured");
        }

        const response = await axios.get(channel.stream_url, {
            responseType: "text",
            timeout: 15000,
            maxRedirects: 3
        });

        const playlist = response.data;

        const proxyUrl = (targetUrl) => {
            return `${apiBase}/channels/proxy?url=${encodeURIComponent(targetUrl)}`;
        };

        const rewritten = playlist
            .split(/\r?\n/)
            .map(line => {
                const trimmed = line.trim();

                if (!trimmed) return line;

                // معالجة روابط URI مثل مفاتيح AES وملفات الصوت
                if (trimmed.startsWith("#")) {
                    return line.replace(
                        /URI="([^"]+)"/g,
                        (_, uri) => {
                            const absoluteUrl = new URL(
                                uri,
                                channel.stream_url
                            ).href;

                            return `URI="${proxyUrl(absoluteUrl)}"`;
                        }
                    );
                }

                // معالجة روابط TS و M3U8
                const absoluteUrl = new URL(
                    trimmed,
                    channel.stream_url
                ).href;

                return proxyUrl(absoluteUrl);
            })
            .join("\n");

        res.setHeader(
            "Content-Type",
            "application/vnd.apple.mpegurl"
        );

        res.setHeader("Cache-Control", "no-cache");

        res.send(rewritten);

    } catch (error) {
        console.error("Proxy Stream Error:", error.message);

        res.status(502).json({
            message: "Failed to load stream"
        });
    }
};

// 4. جلب ومعالجة ملفات الـ Chunk أو الـ Playlists الفرعية عبر الرابط المباشر
exports.proxyFile = async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({
                message: "URL required"
            });
        }

        const apiBase = process.env.PUBLIC_API_URL;

        if (!apiBase) {
            throw new Error("PUBLIC_API_URL is not configured");
        }

        const parsedUrl = new URL(targetUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                message: "Invalid URL protocol"
            });
        }

        const response = await axios.get(targetUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            maxRedirects: 3,
            maxContentLength: 20 * 1024 * 1024
        });

        const contentType = response.headers["content-type"] || "";

        const isM3u8 =
            /\.m3u8(?:$|\?)/i.test(parsedUrl.pathname + parsedUrl.search) ||
            contentType.includes("mpegurl");

        if (isM3u8) {
            const playlist = response.data.toString("utf8");

            const rewritten = playlist
                .split(/\r?\n/)
                .map(line => {
                    const trimmed = line.trim();

                    if (!trimmed) return line;

                    if (trimmed.startsWith("#")) {
                        return line.replace(
                            /URI="([^"]+)"/g,
                            (_, uri) => {
                                const absoluteUrl = new URL(
                                    uri,
                                    targetUrl
                                ).href;

                                return `URI="${apiBase}/channels/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
                            }
                        );
                    }

                    const absoluteUrl = new URL(
                        trimmed,
                        targetUrl
                    ).href;

                    return `${apiBase}/channels/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                })
                .join("\n");

            res.setHeader(
                "Content-Type",
                "application/vnd.apple.mpegurl"
            );

            res.setHeader("Cache-Control", "no-cache");

            return res.send(rewritten);
        }

        res.setHeader(
            "Content-Type",
            contentType || "application/octet-stream"
        );

        if (response.headers["content-length"]) {
            res.setHeader(
                "Content-Length",
                response.headers["content-length"]
            );
        }

        res.send(response.data);

    } catch (error) {
        console.error("Proxy File Error:", error.message);

        res.status(502).json({
            message: "Failed to load stream resource"
        });
    }
};


exports.createChannel = async (req, res) => {
    try {
        const channel = await Channel.create({ ...req.body, source: "manual" });
        res.json(channel);
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};


exports.getChannel = async (req, res) => {
    try {
        const channel = await Channel.findByPk(req.params.id);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" })
        }

        res.json(channel)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.updateChannel = async (req, res) => {
    try {
        const channel = await Channel.findByPk(req.params.id);

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        await channel.update(req.body);
        res.json(channel);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.updateCountry = async (req, res) => {
    try {
        const channel = await Channel.findByPk(req.params.id);

        if (!channel) {
            return res.status(404).json({
                message: "Channel not found!"
            });
        }

        await channel.update({
            country_code: req.body.country_code
        });

        res.json({ success: true });

    } catch (error) {
        console.error("Update Country Error:", error);
        res.status(500).json({ message: error.message });
    }
};
