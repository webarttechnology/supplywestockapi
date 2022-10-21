const authorModel = require("../buyer/buyer.service");
const mongoose = require('mongoose');
var nodemailer = require('nodemailer');
const configData = require("../../config/config.json");

const { genSaltSync, hashSync, compareSync} = require('bcrypt');
const { sign } = require("jsonwebtoken");

const createAuthor = async (req, res) => {
    const body = req.body
    try{    
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        const authorObj = new authorModel({
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password,
            mobileNo : body.mobileNo,
            emailId: body.emailId,
            roleId: "1"
        })
        const data = await authorObj.save();
        return data?res.status(200).json({success: 1, data: data}):res.status(400).json({success: 0, msg: "Insert error. Please try again"})
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getAuthor = async (req, res) => {
    try{

        const author = await authorModel.findOne({})
        return res.status(200).json({
            success: 1,
            data: author
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const updateAuthor = async (req, res) => {
    const body = req.body
    try{
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        const author = await authorModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)},{firstName: body.firstName, lastName: body.lastName, password: body.password, mobileNo: body.mobileNo, emailId: body.emailId});
        return author?res.status(200).json({success: 1, msg: "Update successfully"}):res.status(400).json({success: 0, msg: "Update error. Please try again"})
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const login = async (req, res) => {

    const body = req.body;

    try{

        const author = await authorModel.findOne({emailId: body.emailId, roleId: "1"}, {password: 1, emailId: 1, _id: 1, roleId: 1})
        if(author){
            const encryresult = compareSync(body.password, author.password);
            if(encryresult){
                const jsontoken = sign({result: author}, 'SupplyWeStock', {
                    expiresIn: "1h"
                });

                return res.status(200).json({
                    success: 1,
                    data: {emailId:author.emailId, id: author._id, roleId: 1},
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
                msg: "Email Id does not found"
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

    const checkuser = await authorModel.find({emailId: body.emailId}).count();
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
            from: 'Supplyandstock<'+configData.SMTP_USER+'>',
            to: body.emailId,
            subject:subject,
            text:emailbody
          }; 

        const userupdate = await authorModel.findOneAndUpdate({emailId: body.emailId}, {
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

    const otpver = await authorModel.findrequired({emailId: body.emailId, otp: body.otp}).count();
    if(otpver){

        const p = await authorModel.updateOne({emailId: body.emailId, otp: body.otp}, {password: body.password});

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

const changePassword = async (req, res) => {
    const body = req.body
    try{
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);   
        const checkexistsornot = await authorModel.findOne({_id: mongoose.Types.ObjectId(body.id)}).count()
        if(checkexistsornot){
            const changePass = await authorModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {password: body.password})
            return res.status(200).json({
                success: 1,
                msg: "Password change successfully"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Admin id does not match"
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
        const dataCount = await authorModel.findOne({emailId: req.params.emailId, otp: req.params.otp}).count();
        if(dataCount){
            const updateStatus = await authorModel.findOneAndUpdate({emailId: req.params.emailId}, {isVerified: "1"})
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

module.exports = {
    createAuthor: createAuthor,
    getAuthor: getAuthor,
    updateAuthor: updateAuthor,
    login: login,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    changePassword: changePassword,
    otpverification: otpverification
}