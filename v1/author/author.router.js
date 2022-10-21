const { createAuthor, getAuthor, updateAuthor, login, forgotPassword, resetPassword, changePassword, otpverification} = require("./author.controller")
const router = require("express").Router();
const { checkToken } = require("../../author/token_validations");

router.post("/", createAuthor);
router.get("/", getAuthor);
router.patch("/", updateAuthor);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/otp-verification/:emailId/:otp", otpverification),
router.patch("/change-password", changePassword)
module.exports = router