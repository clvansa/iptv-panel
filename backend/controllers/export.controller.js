const exportService = require("../services/export.service");
const Playlist = require("../models/Playlist");
const Channel = require("../models/Channel");
exports.exportM3u = async (req, res) => {

    try {
        const filters = {};
        
        if (req.query.country) { filters.country_code = req.query.country.toUpperCase(); }

        if (req.query.category) { filters.category = req.query.category; }

        const content = await exportService.generateM3u(filters);

        res.setHeader("Content-Type", "application/x-mpegURL");

        res.setHeader("Content-Disposition", "attachment; filename=playlist.m3u");

        res.send(content);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }

};


exports.exportPlaylist = async (req, res) => {

    try {

        const playlist =
            await Playlist.findByPk(
                req.params.id,
                {
                    include: [
                        {
                            model: Channel,
                            through: {
                                attributes: ["position", "favorite"]
                            }
                        }
                    ]
                }
            );

        if (!playlist) {

            return res.status(404).json({
                message: "Playlist not found"
            });

        }



        playlist.Channels.sort(
            (a, b) => {

                if (
                    a.PlaylistChannel.favorite !==
                    b.PlaylistChannel.favorite
                ) {

                    return (
                        Number(
                            b.PlaylistChannel.favorite
                        ) -
                        Number(
                            a.PlaylistChannel.favorite
                        )
                    );

                }

                return (
                    a.PlaylistChannel.position -
                    b.PlaylistChannel.position
                );

            }
        );



        let m3u = "#EXTM3U\n\n";

        for (const channel of playlist.Channels) {

            m3u +=
                `#EXTINF:-1 tvg-id="${channel.tvg_id || ""}" tvg-logo="${channel.logo || ""}" group-title="${channel.category || ""}",${channel.name}
${channel.stream_url}

`;

        }

        res.setHeader(
            "Content-Type",
            "application/x-mpegURL"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${playlist.name}.m3u"`
        );
        res.send(m3u);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};