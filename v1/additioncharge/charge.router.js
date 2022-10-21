const { chargeGet, chargeUpdate, chargeAdd } =  require("./charge.controller");

const router = require("express").Router();

router.get("/", chargeGet);
router.patch("/", chargeUpdate);
router.post("/", chargeAdd);

module.exports = router;