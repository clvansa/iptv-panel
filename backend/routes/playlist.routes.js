const router = require("express").Router();

const controller = require("../controllers/playlist.controller");

router.post("/", controller.createPlaylist);

router.get("/:id", controller.getPlaylist);

router.get("/", controller.getPlaylists);

router.post("/:id/channels", controller.addChannels);

router.post("/:id/add-filtered", controller.addFilteredChannels);

router.delete("/:playlistId/channels/:channelId", controller.removeChannel);

router.delete("/:id", controller.deletePlaylist);

router.delete("/:id/channels", controller.removeChannels);

router.put("/:id/reorder", controller.reorderChannels);

router.put("/:id/country-order", controller.updateCountryOrder);

router.put("/:playlistId/channels/:channelId/country", controller.updatePlaylistChannelCountry);

router.put("/:playlistId/channels/:channelId/favorite", controller.toggleFavorite);

module.exports = router;