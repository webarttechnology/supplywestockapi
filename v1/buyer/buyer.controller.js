const buyerModle = require("./buyer.service");
const mongoose = require('mongoose');

const { genSaltSync, hashSync, compareSync} = require('bcrypt');
const { sign } = require("jsonwebtoken");
var nodemailer = require('nodemailer');
const configData = require("../../config/config.json");

const createBuyer = async (req, res) => {    
    const body = req.body

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    body.otp =  Math.random().toString().substr(2, 6); 

   

    try{      
        const uniqueCheck  = await buyerModle.find({emailId: body.emailId}).count();
        if(uniqueCheck){
            return res.status(400).json({
                success: 0,
                msg: "Email id already exists"
            })
        } 



        to = body.emailId
        subject = "Email Verification"
        emailbody = "Your email verification code is "+body.otp
        var transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net", // hostname
            secureConnection: false, // TLS requires secureConnection to be false
            port: 465, // port for secure SMTP
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

        const buyerObj = new buyerModle({
            userCode: Math.random().toString().substr(2, 4),
	    firstName: body.firstName,
            lastName: body.lastName,
            mobileNo: body.mobileNo,
            emailId: body.emailId,
            password: body.password,
            address: body.address,
            otp: body.otp,
            roleId: "3"
        })
        const buyer = await buyerObj.save();

        const jsontoken = sign({result: buyer}, 'SupplyWeStock', {
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

const getBuyer = async (req, res) => {    
    try{
        const buyer = await buyerModle.find({"roleId": "3"}, {firstName: 1, lastName: 1, mobileNo: 1, emailId: 1, address: 1, city: 1, pincode: 1, state: 1, _id: 1, isVerified: 1})
        return res.status(200).json({
            success: 1,
            data: buyer
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


const getBuyerById = async (req, res) => {
    try{        
        const data = await buyerModle.findOne({_id:mongoose.Types.ObjectId(req.params.id)}, {firstName: 1, lastName: 1, mobileNo: 1, emailId: 1, address: 1, city: 1, pincode: 1, state: 1, _id: 0, isVerified: 1})
        return res.status(200).json({
            success: 1,
            data: data
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


const otpverification = async (req, res) => {     
        try{
            const dataCount = await buyerModle.findOne({emailId: req.params.emailId, otp: req.params.otp}).count();
            if(dataCount){
                const updateStatus = await buyerModle.findOneAndUpdate({emailId: req.params.emailId}, {isVerified: "1"})
                const jsontoken = sign({result: updateStatus}, 'SupplyWeStock', {
                    expiresIn: "1h"
                });
               
                return res.status(200).json({
                    success: 1,
                    msg: "OTP verified",
                    token_code: jsontoken 
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


const sendOtp = async (req, res) => {
    try{
        const buyerDetails = await buyerModle.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, {_id: 0, emailId: 1});
        if(buyerDetails){            
            const otp =  Math.random().toString().substr(2, 6); 
            subject = "Email Verification"
            emailbody = `Your Email verification code is ${otp}`

            var transporter = nodemailer.createTransport({
                host: "smtpout.secureserver.net", // hostname
                secureConnection: false, // TLS requires secureConnection to be false
                port: 465, // port for secure SMTP
                auth: {
                  user: configData.SMTP_USER,
                  pass: configData.SMTP_PASSWORD
                }
            });
              
              var mailOptions = {
                from: 'Supplywestock<'+configData.SMTP_USER+'>',
                to: buyerDetails.emailId,
                subject:subject,
                text:emailbody
              }; 

           

              const updateOtp = await buyerModle.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)}, {otp: otp});
              
              transporter.sendMail(mailOptions, function(error, info){               
                return res.status(200).json({
                    success: 1,
                    msg: "OTP send to buyer registered Email Id"
                }) 
             });              

        }else{
            return res.status(400).json({
                success: 0,
                msg: "Buyer id does not match"
            })
        }

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
        const checkexistsornot = await buyerModle.findOne({_id: mongoose.Types.ObjectId(body.id)}).count()
        if(checkexistsornot){
            const changePass = await buyerModle.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {password: body.password})
            return res.status(200).json({
                success: 1,
                msg: "Password change successfully"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Buyer id does not match"
            })
        }     
        
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const updateBuyer = async (req, res) => {
    const body = req.body;
    try{
        const updateData = await buyerModle.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {firstName: body.firstName, lastName: body.lastName, mobileNo: body.mobileNo, address: body.address, city: body.city, state: body.state, pincode: body.pincode})
        if(updateData){
            return res.status(200).json({
                success: 1,
                msg: "Update successfully"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Buyer Id not found"
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
        const sellerData = await buyerModle.findOne({"emailId": body.emailId, roleId: "3"}, {emailId: 1, password: 1, roleId: 1})
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

    const checkuser = await buyerModle.find({emailId: body.emailId}).count();
    if(checkuser){

        body.otp =  Math.random().toString().substr(2, 6); 
        to = body.emailId
        subject = "Reset password"
        emailbody = "Your reset password otp is "+body.otp
     
        var transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net", // hostname
            secureConnection: false, // TLS requires secureConnection to be false
            port: 465, // port for secure SMTP
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

        const userupdate = await buyerModle.findOneAndUpdate({emailId: body.emailId}, {
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

    const otpver = await buyerModle.find({emailId: body.emailId, otp: body.otp}).count();
    if(otpver){

        const p = await buyerModle.updateOne({emailId: body.emailId, otp: body.otp}, {password: body.password});

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


const deleteBuyer = async (req, res) => {
    try{
        const buyer = await buyerModle.findOneAndDelete({"_id": req.params.id, "roleId": "3"})
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

const searchBuyer = async (req, res) => {
    
    try{
        const buyerData = await buyerModle.find({ 'firstName' : {'$regex': '^'+req.params.key, "$options": "i"}, "roleId": "3" })
       
        return res.status(200).json({
            success: 1,
            data: buyerData
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}




module.exports = {
    createBuyer: createBuyer,
    getBuyer: getBuyer,
    getBuyerById: getBuyerById,
    otpverification: otpverification,
    changePassword: changePassword,
    sendOtp: sendOtp,
    updateBuyer: updateBuyer,
    login: login,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    deleteBuyer: deleteBuyer,
    searchBuyer: searchBuyer
}
