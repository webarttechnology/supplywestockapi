const { createOrder, getOrder, getOrderById, updateOrder, deleteOrder, getorderBySellerId, getorderByBuyerId} = require("./order.controller");

const router = require('express').Router();

const { checkToken } = require("../../author/token_validations");


router.post("/", createOrder);
router.get("/", checkToken, getOrder);
router.get("/:id", checkToken, getOrderById);
router.patch("/", checkToken, updateOrder);
router.delete("/", checkToken, deleteOrder);
router.get("/seller/:sellerId", getorderBySellerId);
router.get("/buyer/:buyerId", getorderByBuyerId);
module.exports = router;
