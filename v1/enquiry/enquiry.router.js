const { createEnquiry, getEnquiry, getEnquiryByBuyerId, getEnquiryByManufacturerId, acceptEnquiryByadmin, getSellersByEnquery }= require("./enquiry.controller");

const router = require("express").Router();

const { checkToken } = require("../../author/token_validations");



router.post("/", createEnquiry);
router.get("/", getEnquiry);
router.get("/buyer/:buyerId", checkToken, getEnquiryByBuyerId);
router.get("/manufacturer/:manufacturerId", getEnquiryByManufacturerId);
router.get("/accept/:adminId/:enquiryId", acceptEnquiryByadmin);
router.get("/sellers/:enquiryId", getSellersByEnquery);

module.exports = router
