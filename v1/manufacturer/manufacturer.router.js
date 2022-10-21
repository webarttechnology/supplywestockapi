const { createManufacturer, getManufacturer, getManufacturerById, updateManufacturer, deleteManufacturer, getcountData, searchManufacturer } = require("./manufacturer.controller");
const router = require("express").Router();
const { checkToken } = require("../../author/token_validations");


router.post("/", createManufacturer);
router.get("/", getManufacturer);
router.get("/:id", getManufacturerById);
router.patch("/", updateManufacturer);
router.delete("/:id", deleteManufacturer);
router.get("/all/count", checkToken, getcountData)
router.get("/search/:key", searchManufacturer);
module.exports = router
