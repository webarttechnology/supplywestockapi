const {createPaymentLink, requestPaymentLink, updatePayment } = require('./payment.controller')

const router = require('express').Router();
const { checkToken } = require("../../author/token_validations");
router.post('/', createPaymentLink);
router.post('/request', requestPaymentLink);
router.patch("/success", updatePayment)
module.exports = router;
