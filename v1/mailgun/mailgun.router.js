const {sendMail} = require("./mailgun.controller");
const router = require("express").Router();

router.post("/", sendMail);

module.exports = router