const {createBuyer, getBuyer, getBuyerById, otpverification, changePassword, sendOtp, updateBuyer, login, forgotPassword, resetPassword, deleteBuyer, searchBuyer}  = require("./buyer.controller");
const router = require("express").Router();
const { checkToken } = require("../../author/token_validations");

router.post("/", createBuyer);
router.get("/", getBuyer);
router.get("/:id", getBuyerById),
router.get("/otp-verification/:emailId/:otp", otpverification),
router.patch("/change-password", checkToken, changePassword)
router.get("/send-otp/:id", sendOtp)
router.patch("/", checkToken, updateBuyer)
router.delete("/:id", deleteBuyer)
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/search/:key", searchBuyer);
module.exports = router;