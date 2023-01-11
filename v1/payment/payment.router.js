const {createPaymentLink, requestPaymentLink, updatePayment, createStripeAccount, transferMoney, accountActivation } = require('./payment.controller')

const router = require('express').Router();
const { checkToken } = require("../../author/token_validations");
router.post('/', createPaymentLink);
router.post('/request', requestPaymentLink);
router.patch("/success", updatePayment)
router.patch("/active-payment", createStripeAccount)
router.post("/transfer-money", transferMoney);
router.patch("/account-activation", accountActivation);
module.exports = router;
