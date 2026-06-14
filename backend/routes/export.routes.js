const router = require("express").Router();

const controller = require("../controllers/export.controller");

router.get("/", controller.exportM3u);

router.get("/playlist/:id", controller.exportPlaylist);


module.exports = router;