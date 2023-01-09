const router = require('express').Router();
const { checkToken } = require("../../author/token_validations");
const { createTransaction, getTransaction } = require("./transaction.controller");
router.post('/', createTransaction);
router.get('/', getTransaction);
module.exports = router; 
