const {createSeller, updateSeller, getSeller, getSellerById, changePassword, sendOtp, otpverification, login, forgotPassword, resetPassword, chooseManufacturer, removeManufacturer, getUserCount, deleteSeller, searchSeller } = require("./seller.controller")
const router = require('express').Router();
const { checkToken } = require("../../author/token_validations");


router.post("/", createSeller);
router.get("/", getSeller);
router.patch("/", checkToken, updateSeller);
router.delete("/:id", deleteSeller);
router.get("/:id", getSellerById);
router.patch("/change-password", checkToken, changePassword);
router.get("/send-otp/:id", sendOtp)
router.get("/otp-verification/:emailId/:otp", otpverification)
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/choose-manufacturer", checkToken, chooseManufacturer);
router.patch("/remove-manufacturer", checkToken, removeManufacturer);
router.get('/report/all/user/count', checkToken, getUserCount)
router.get("/search/:key", searchSeller);
module.exports = router;
