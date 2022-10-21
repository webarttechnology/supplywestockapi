
const {createChatroom, getchatRoom} = require("./chatroom.controller");
const router = require("express").Router()
router.get("/:userCode", getchatRoom);
module.exports = router