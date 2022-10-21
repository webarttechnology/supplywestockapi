const {createNotification, getNotificationByuserId, acceptBySeller } = require("./notification.controller");

const router = require('express').Router();

const { checkToken } = require("../../author/token_validations");

router.post("/", checkToken, createNotification);
router.get("/:userId", checkToken, getNotificationByuserId);
router.get("/accept/:userId/:enquiryId", checkToken, acceptBySeller)

module.exports = router
