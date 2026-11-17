const { Op } = require("sequelize");
const Playlist = require("../models/Playlist");
const Channel = require("../models/Channel");
const PlaylistChannel = require("../models/PlaylistChannel");

exports.createPlaylist = async (req, res) => {
    try {

        if (typeof req.body.name !== "string" || !req.body.name.trim()) {
            return res.status(400).json({
                message: "Playlist name is required"
            });
        }

        const playlist = await Playlist.create({
            name: req.body.name.trim(),
            description: req.body.description,
            country_order: [
                "SY",
                "LB",
                "SA",
                "IQ",
                "JO",
                "PS",
                "EG",
                "AE",
                "QA",
                "KW",
                "BH",
                "OM",
                "OTHER"
            ]
        });

        res.json(playlist);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            order: [["id", "DESC"]]
        });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id, {
            include: [{
                model: Channel,
                through: { attributes: ["position", "country_code", "favorite"] }
            }]
        });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        playlist.Channels.sort((a, b) => (a.PlaylistChannel?.position || 0) - (b.PlaylistChannel?.position || 0));
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.addChannels = async (req, res) => {
    try {
        if (!Array.isArray(req.body.channelIds) || req.body.channelIds.length === 0) {
            return res.status(400).json({
                message: "channelIds must be a non-empty array"
            });
        }
        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const maxPosition = await PlaylistChannel.max("position", {
            where: { PlaylistId: playlist.id }
        });

        let position = maxPosition === null ? 0 : maxPosition + 1;

        for (const channelId of req.body.channelIds) {
            const [item, created] = await PlaylistChannel.findOrCreate({
                where: { PlaylistId: playlist.id, ChannelId: channelId },
                defaults: {
                    position: position
                }
            });

            if (created) {
                position++;
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addFilteredChannels = async (req, res) => {


    try {
        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const where = {};
        if (req.body.language) where.language = req.body.language;
        if (req.body.country) where.country_code = req.body.country;
        if (req.body.category) where.category = req.body.category;
        if (req.body.search) {
            where.name = { [Op.like]: `%${req.body.search}%` };
        }

        const channels = await Channel.findAll({ where });

        const maxPosition = await PlaylistChannel.max("position", {
            where: { PlaylistId: playlist.id }
        });

        let position = maxPosition === null ? 0 : maxPosition + 1;

        for (const channel of channels) {
            const [item, created] = await PlaylistChannel.findOrCreate({
                where: { PlaylistId: playlist.id, ChannelId: channel.id },
                defaults: {
                    position,
                    country_code: channel.country_code
                }
            });

            if (created) {
                position++;
            }
        }

        res.json({ success: true, count: channels.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeChannel = async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.playlistId);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const channel = await Channel.findByPk(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        await playlist.removeChannel(channel);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        await playlist.destroy();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.reorderChannels = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const channelIds = req.body.channelIds;

        if (!Array.isArray(channelIds)) {
            return res.status(400).json({
                message: "channelIds must be an array"
            });
        }

        await sequelize.transaction(async (transaction) => {
            for (let i = 0; i < channelIds.length; i++) {
                await PlaylistChannel.update(
                    { position: i },
                    {
                        where: {
                            PlaylistId: playlistId,
                            ChannelId: channelIds[i]
                        },
                        transaction
                    }
                );
            }
        });

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateCountryOrder = async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        playlist.country_order = req.body.countryOrder;
        await playlist.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.removeChannels = async (req, res) => {
    try {
        if (!Array.isArray(req.body.channelIds) || req.body.channelIds.length === 0) {
            return res.status(400).json({
                message: "channelIds must be a non-empty array"
            });
        }
        await PlaylistChannel.destroy({
            where: {
                PlaylistId: req.params.id,
                ChannelId: req.body.channelIds
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updatePlaylistChannelCountry = async (req, res) => {
    try {
        const item = await PlaylistChannel.findOne({
            where: {
                PlaylistId: req.params.playlistId,
                ChannelId: req.params.channelId
            }
        })
        console.log(req.params)
        if (!item) {
            return res.status(404).json({ message: "Channel not found in playlist" })
        }

        await item.update({
            country_code: req.body.country_code
        })

        res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.toggleFavorite = async (req, res) => {

    try {

        const item = await PlaylistChannel.findOne({
            where: {
                PlaylistId: req.params.playlistId,
                ChannelId: req.params.channelId
            }
        })
        if (!item) {
            return res.status(404).json({ message: "Channel not found" });
        }
        await item.update({
            favorite: req.body.favorite
        })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}