const pushnotificationModel = require("./pushnotification.service");
const mongoose = require("mongoose");

const createPushNotification = async (req, res) => {
    const body = req.body;
    try{
        const notification = new pushnotificationModel({
            message: "One new enquiry generate by buyer",
            showFor: [mongoose.Types.ObjectId("630f472eb83387e6dc0230d0"), mongoose.Types.ObjectId("630f472eb83387e6dc0230d0")] 
        })

        const saveObj = await notification.save();

        return res.status(200).json({
            success: 1,
            data: saveObj
        })
        
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getPushNotification = async (req, res) => {

}


const hidePushNotification = async (req, res) => {
    const body = req.body;
    try{
        const notification = await pushnotificationModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {isShow: "1"})
        return res.status(200).json({
            success: 1,
            msg: "update successfull!"
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


module.exports = {
    createPushNotification: createPushNotification,
    getPushNotification: getPushNotification,
    hidePushNotification:hidePushNotification
}