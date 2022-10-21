const { createChat, getChat, readChat} = require("./chat.controller");

const router = require("express").Router();

router.post("/", createChat);
router.get("/:chatroomId", getChat);
router.patch("/", readChat);
module.exports = router;
