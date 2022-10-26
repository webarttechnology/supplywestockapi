const sellerModel = require("../buyer/buyer.service");
const mongoose = require('mongoose');
const manufacturerModel = require("../manufacturer/manufacturer.service");

const configData = require("../../config/config.json");


const { genSaltSync, hashSync, compareSync} = require('bcrypt');
const { sign } = require("jsonwebtoken");
var nodemailer = require('nodemailer');
const createSeller = async (req, res) => {
     
    const body = req.body

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    body.otp =  Math.random().toString().substr(2, 6); 

   

    try{      
        const uniqueCheck  = await sellerModel.find({emailId: body.emailId}).count();
        if(uniqueCheck){
            return res.status(400).json({
                success: 0,
                msg: "Email id already exists"
            })
        } 



        to = body.emailId
        subject = "Email Verification"
        emailbody = "Your Email verification code is "+body.otp
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: configData.SMTP_USER,
              pass: configData.SMTP_PASSWORD
            }
          });
          
          var mailOptions = {
            from: 'Supplywestock<'+configData.SMTP_USER+'>',
            to: body.emailId,
            subject:subject,
            text:emailbody
          }; 



        const buyerObj = new sellerModel({
            userCode: Math.random().toString().substr(2, 4),
	    firstName: body.firstName,
            lastName: body.lastName,
            mobileNo: body.mobileNo,
            emailId: body.emailId,
            password: body.password,
            address: body.address,
            otp: body.otp,
            roleId: "2"
        })
        const buyer = await buyerObj.save();


        const jsontoken = sign({result: buyer}, '', {
            expiresIn: "1h"
        });

        transporter.sendMail(mailOptions, function(error, info){
          
            return res.status(200).json({
                success: 1,
                data: buyer,
                token_code: jsontoken
            }) 
         });  
        

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getSeller = async (req, res) => {
    try{
        const seller = await sellerModel.find({"roleId": "2"}, {firstName: 1, lastName: 1, mobileNo: 1, emailId: 1, address: 1, city: 1, pincode: 1, state: 1, _id: 1, isVerified: 1})
        return res.status(200).json({
            success: 1,
            data: seller
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const updateSeller = async (req, res) => {
    const body = req.body;
    try{
        const updateData = await sellerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {firstName: body.firstName, lastName: body.lastName, mobileNo: body.mobileNo, address: body.address, city: body.city, state: body.state, pincode: body.pincode})
        if(updateData){
            return res.status(200).json({
                success: 1,
                msg: "Update successfully"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Seller Id not found"
            })
        }
       
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getSellerById = async (req, res) => {
    try{        
       
       const data = await sellerModel.aggregate([
        {
            $lookup: {
                from: "manufactures",
                localField: "manufacturer", 
                foreignField: "_id", 
                as: "manufacturer"
            }
        },
       {
        $match: {_id: mongoose.Types.ObjectId(req.params.id)}
       },
       {
        $project: {firstName: 1, lastName: 1, mobileNo: 1, emailId: 1, address: 1, city: 1, pincode: 1, state: 1, _id: 0, isVerified: 1, "manufacturer.name":1, "manufacturer.image":1, "manufacturer._id":1,}
       },
    ])
     
        return res.status(200).json({
            success: 1,
            data: data[0]
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const changePassword = async (req, res) => {
    const body = req.body
    try{
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);   
        const checkexistsornot = await sellerModel.findOne({_id: mongoose.Types.ObjectId(body.id)}).count()
        if(checkexistsornot){
            const changePass = await sellerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {password: body.password})
            return res.status(200).json({
                success: 1,
                msg: "Password change successfully"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Seller id does not match"
            })
        }     
        
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const sendOtp = async (req, res) => {
    try{
        const sellerDetails = await sellerModel.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, {_id: 0, emailId: 1});
        if(sellerDetails){            
            const otp =  Math.random().toString().substr(2, 6); 
            subject = "Email Verification"
            emailbody = `Your Email verification code is ${otp}`
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: configData.SMTP_USER,
                  pass: configData.SMTP_PASSWORD
                }
              });
              
              var mailOptions = {
                from: 'Supplywestock<'+configData.SMTP_USER+'>',
                to: sellerDetails.emailId,
                subject:subject,
                text:emailbody
              }; 

           
              const updateOtp = await sellerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)}, {otp: otp});
              
              transporter.sendMail(mailOptions, function(error, info){
          
                return res.status(200).json({
                    success: 1,
                    msg: "OTP send to seller registered Email Id"
                }) 
             });              

        }else{
            return res.status(400).json({
                success: 0,
                msg: "Seller id does not match"
            })
        }

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const otpverification = async (req, res) => {     
    try{
        const dataCount = await sellerModel.findOne({emailId: req.params.emailId, otp: req.params.otp}).count();
        if(dataCount){
            const updateStatus = await sellerModel.findOneAndUpdate({emailId: req.params.emailId}, {isVerified: "1"})
            return res.status(200).json({
                success: 1,
                msg: "OTP verified"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Otp does not match"
            })
        }
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const login = async (req, res) => {
    const body = req.body       
    try{
        const sellerData = await sellerModel.findOne({"emailId": body.emailId, "roleId": "2"}, {emailId: 1, password: 1, roleId: 1})
        if(sellerData){

            const encryresult = compareSync(body.password, sellerData.password);
            if(encryresult){

                const jsontoken = sign({result: sellerData}, 'SupplyWeStock', {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                   success: 1,
                   data: {emailId:sellerData.emailId, id: sellerData._id, roleId: sellerData.roleId},
                   token_code: jsontoken 
                })


            }else{
                return res.status(400).json({
                    success: 0,
                    msg: "Password does not match"
                })
            }

        }else{
            return res.status(400).json({
                success: 0,
                msg: "Email Id does not match"
            })
        }
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const forgotPassword =  async (req, res) => {

    const body = req.body;

    const checkuser = await sellerModel.find({emailId: body.emailId}).count();
    if(checkuser){

        body.otp =  Math.random().toString().substr(2, 6); 
        to = body.emailId
        subject = "Reset password"
        emailbody = "Your reset password otp is "+body.otp
     
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: configData.SMTP_USER,
              pass: configData.SMTP_PASSWORD
            }
          });
          
          var mailOptions = {
            from: 'Supplywestock<'+configData.SMTP_USER+'>',
            to: body.emailId,
            subject:subject,
            text:emailbody
          }; 

        const userupdate = await sellerModel.findOneAndUpdate({emailId: body.emailId}, {
            otp: body.otp
        });

       

        transporter.sendMail(mailOptions, function(error, info){
            return res.status(200).json({
                success: 1,
                message: "OTP sent to registered email id!"
            }) 
        }); 

    }else{
        return res.status(200).json({
            success: 0,
            message: "Email id does not match"
        }) 
    }
}

const resetPassword = async (req, res) => {
    const body = req.body;

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    const otpver = await sellerModel.find({emailId: body.emailId, otp: body.otp}).count();
    if(otpver){

        const p = await sellerModel.updateOne({emailId: body.emailId, otp: body.otp}, {password: body.password});

        if(p.modifiedCount == 1){
            return res.status(200).json({
                success: 1,
                message: "Password changed successfully"
            }) 
        }else{
            return res.status(200).json({
                success: 0,
                message: "Error!! Please try again"
            }) 
        }

    }else{
        return res.status(200).json({
            success: 0,
            message: "Invaid otp. Please resend."
        }) 
    }
}

const chooseManufacturer = async (req, res) => {
    const body = req.body 
    try{
        const manufacturer = await sellerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {$push: {manufacturer: mongoose.Types.ObjectId(body.manufacturer)}})
        const manu = await manufacturerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.manufacturer)}, {$push: {sellers: mongoose.Types.ObjectId(body.id)}})       
        return manufacturer && manu?res.status(200).json({success: 1, msg: "Update successfull"}):res.status(400).json({success: 0, msg: "Update error. Please try again"})
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const removeManufacturer = async (req, res) => {
    const body = req.body 
    try{
        const manufacturer = await sellerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {$pull: {manufacturer: mongoose.Types.ObjectId(body.manufacturer)}})
        const manu = await manufacturerModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.manufacturer)}, {$pull: {sellers: mongoose.Types.ObjectId(body.id)}})       
        return manufacturer && manu?res.status(200).json({success: 1, msg: "Update successfull"}):res.status(400).json({success: 0, msg: "Update error. Please try again"})

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getUserCount = async (req, res) => {
    try{
        const result = [];
        const userCount = await sellerModel.aggregate([
            {
                $group: {
                    _id: '$roleId',
                    count: { $sum: 1 }
                }
            }
        ])

        return res.status(200).json({
            success: 1,
            data: userCount
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const deleteSeller = async (req, res) => {
    try{
        const buyer = await sellerModel.findOneAndDelete({"_id": req.params.id, "roleId": "2"})
        return res.status(200).json({
            sucess: 1,
            msg: "Data deleted successfully"
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


const searchSeller = async (req, res) => {    
    try{
        const sellerData = await sellerModel.find({ 'firstName' : {'$regex': '^'+req.params.key, '$options': 'i'}, "roleId": "2" })
       
        return res.status(200).json({
            success: 1,
            data: sellerData
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


module.exports = {
    getSeller: getSeller,
    createSeller: createSeller,
    updateSeller: updateSeller,
    getSellerById: getSellerById,
    changePassword: changePassword,
    sendOtp: sendOtp,
    otpverification: otpverification,
    login: login,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    chooseManufacturer: chooseManufacturer,
    removeManufacturer: removeManufacturer,
    getUserCount: getUserCount,
    deleteSeller: deleteSeller,
    searchSeller: searchSeller
}
