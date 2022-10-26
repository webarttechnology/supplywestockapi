const {createPushNotification, getPushNotification} = require('./pushnotification.controller')

const router = require('express').Router();

router.post("/", createPushNotification);
router.get("/", getPushNotification);

module.exports = router;