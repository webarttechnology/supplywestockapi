const { createOrder, getOrder, getOrderById, updateOrder, deleteOrder, getorderBySellerId, getorderByBuyerId, getwalletAmount} = require("./order.controller");

const router = require('express').Router();

const { checkToken } = require("../../author/token_validations");


router.post("/", createOrder);
router.get("/", checkToken, getOrder);
router.get("/:id", checkToken, getOrderById);
router.patch("/", checkToken, updateOrder);
router.delete("/", checkToken, deleteOrder);
router.get("/seller/:sellerId", getorderBySellerId);
router.get("/buyer/:buyerId", getorderByBuyerId);
router.get("/total/balanace/:sellerId", getwalletAmount);
module.exports = router;
