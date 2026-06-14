const router =
    require("express").Router();

const importController =
    require("../controllers/import.controller");

router.post("/url", importController.importUrl);

module.exports = router;