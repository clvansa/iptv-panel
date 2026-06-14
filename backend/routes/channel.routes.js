const router = require("express").Router();

const controller = require("../controllers/channel.controller");

router.get("/", controller.getChannels);

router.get('/:id', controller.getChannel);

router.post("/:id/check", controller.checkChannel);

router.post("/", controller.createChannel)

router.get("/:id/stream", controller.proxyStream)

router.get("/proxy", controller.proxyFile);

router.put("/:id", controller.updateChannel)

router.put("/:id/country", controller.updateCountry)

module.exports = router;