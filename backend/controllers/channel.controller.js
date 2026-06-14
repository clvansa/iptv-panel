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
            return res.status(404).json({ message: "Channel not found" });
        }

        const response = await axios.get(channel.stream_url, { responseType: "text" });
        const playlist = response.data;
        const baseUrl = channel.stream_url.substring(0, channel.stream_url.lastIndexOf("/") + 1);

        const rewritten = playlist
            .split("\n")
            .map(line => {
                // معالجة أسطر الميتا داتا التي تحتوي على روابط مثل الـ الكي أو الكاستم تراكس
                if (line.includes('URI="')) {
                    return line.replace(/URI="([^"]+)"/, (_, uri) => {
                        const absoluteUrl = new URL(uri, baseUrl).href;
                        return `URI="http://localhost:5000/api/channels/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
                    });
                }

                // تجنب الأسطر الفارغة أو التعليقات الخاصة بالـ M3U8
                if (!line.trim() || line.startsWith("#")) {
                    return line;
                }

                // تحويل الروابط النسبية لملفات الـ TS إلى روابط مطلقة وتمريرها عبر البروكسي
                const absoluteUrl = new URL(line, channel.stream_url).href;
                return `http://localhost:5000/api/channels/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            })
            .join("\n");

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

        res.send(rewritten);

    } catch (error) {
        console.error("Proxy Stream Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. جلب ومعالجة ملفات الـ Chunk أو الـ Playlists الفرعية عبر الرابط المباشر
exports.proxyFile = async (req, res) => {
    try {
        const response = await axios.get(req.query.url, { responseType: "arraybuffer" });

        res.setHeader("Access-Control-Allow-Origin", "*");

        if (req.query.url.endsWith(".m3u8")) {
            const baseUrl = req.query.url.substring(0, req.query.url.lastIndexOf("/") + 1);

            // إصلاح تحويل الـ Buffer لنص بترميز utf8
            const playlist = response.data.toString("utf8");

            const rewritten = playlist
                .split("\n")
                .map(line => {
                    if (!line.trim() || line.startsWith("#")) {
                        return line;
                    }

                    const absoluteUrl = new URL(line, baseUrl).href;
                    return `http://localhost:5000/api/channels/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                })
                .join("\n");

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            return res.send(rewritten);
        }

        res.send(response.data);

    } catch (error) {
        console.error("Proxy File Error:", error);
        res.status(500).json({ message: error.message });
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
            return rrs.status(404).json({ message: "Channel not found" })
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
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
        return res.status(404).json({ message: "Channel not found!" })

    }
    await channel.update({
        country_code: req.body.country_code
    })
    res.json({ success: true })
}