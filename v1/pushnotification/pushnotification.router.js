const {createPushNotification, getPushNotification, hidePushNotification} = require('./pushnotification.controller')

const router = require('express').Router();

router.post("/", createPushNotification);
router.get("/", getPushNotification);
router.patch("/", hidePushNotification);

module.exports = router;