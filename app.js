const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer');
const dotenv = require('dotenv');
const configData = require("./config/config.json");
dotenv.config();
const mongodb = require('./db');
const http = require('http').createServer(app);
const cors = require('cors')
const io = require("socket.io")(http, {cors: {origin: "*"}})

const buyerRouter = require("./v1/buyer/buyer.router");
const sellerRouter = require("./v1/seller/seller.router");
const manufacturerRouter = require("./v1/manufacturer/manufacturer.router");
const authorRouter = require("./v1/author/author.router");
const enquiryRouter = require("./v1/enquiry/enquiry.router");
const emailRouter = require("./v1/mailgun/mailgun.router");
const notificationRouter = require("./v1/notification/notification.router");
const chatroomRouter = require("./v1/chatroom/chatroom.router");
const chatRouter = require("./v1/chat/chat.router");
const orderRouter = require("./v1/order/order.router");
const paymentRouter = require('./v1/payment/payment.router');
const additionalChargesRouter = require("./v1/additioncharge/charge.router");
const pushnotificationRouter = require("./v1/pushnotification/pushnotification.router");

const upload = multer({
	limits: { fieldSize: 25 * 1024 * 1024 }
});


app.use(cors());
app.use(upload.none());
app.use(bodyParser.json({ limit: '500000mb' }));
app.use(bodyParser.urlencoded({ limit: '500000mb', extended: true }));

app.use("/v1/buyers", buyerRouter);
app.use("/v1/sellers", sellerRouter);
app.use("/v1/manufacturers", manufacturerRouter);
app.use("/v1/author", authorRouter);
app.use("/v1/enquiries", enquiryRouter);
app.use("/v1/email", emailRouter);
app.use("/v1/notification", notificationRouter);
app.use("/v1/chatroom", chatroomRouter);
app.use("/v1/chat", chatRouter);
app.use("/v1/order", orderRouter);
app.use("/v1/payment", paymentRouter);
app.use("/v1/charges", additionalChargesRouter);
app.use("/v1/pushnotification", pushnotificationRouter);


http.listen(configData.PORT, '0.0.0.0', () => {
	console.log(`Server is running with the port ${configData.PORT}`);
})

const chatModel = require("./v1/chat/chat.service");
const chatroomModel = require("./v1/chatroom/chatroom.service");
const pushnotificationModel = require("./v1/pushnotification/pushnotification.service");
const { mongoose } = require("mongoose");

io.on('connection', async function(socket){

  socket.on('createChat', async function(msg){

    

      const createMessage = new chatModel({
        chatroomId: mongoose.Types.ObjectId(msg.chatroomId),
        senderId: mongoose.Types.ObjectId(msg.senderId),
        message: [{msg: msg.message}]
      })
      const chatObj = await createMessage.save();      
      const getAllMsg = await chatModel.aggregate([{
        $lookup: {
            from: "sellers",
            foreignField: "_id",
            localField: "senderId",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    },
    {
        $match: {chatroomId: mongoose.Types.ObjectId(msg.chatroomId)}
    },
    {
        $project: {"user.firstName": 1, "user.lastName": 1, "user.userCode": 1, "chatroomId": 1, 'user.userCode': 1, senderId: 1, message: 1, createdAt: 1}
    }])
    socket.broadcast.emit('receiveChat', getAllMsg);
    
  });

	
     socket.on('getChatHistory', async function(msg){

      const getAllMsg = await chatModel.aggregate([{
          $lookup: {
              from: "sellers",
              foreignField: "_id",
              localField: "senderId",
              as: "user"
          }
      },
      {
          $unwind: "$user"
      },
      {
          $match: {chatroomId: mongoose.Types.ObjectId(msg.chatroomId)}
      },
      {
          $project: {"user.firstName": 1, "user.lastName": 1, "chatroomId": 1, 'user.userCode': 1, senderId: 1, message: 1, createdAt: 1}
      }])

        console.log(getAllMsg);
	socket.broadcast.emit('receiveChat', getAllMsg);
  })
 
socket.on('chatroom', async function(msg){ 
  const chatroom = await chatroomModel.aggregate([
    {
        '$sort': {
          "sellers.firstName": -1
        }
    },
    {
        $lookup: {
            from: "enquiries",
            localField: "enquiryId",
            foreignField: "_id",
            as: "enquiry"
        }
    },
    {
        $lookup: {
            from: "sellers",
            localField: "userCode",
            foreignField: "_id",
            as: "users"                    
        }              
    }, 
    {
        $lookup: {
            from: "chats",
            localField: "_id",
            foreignField: "chatroomId",
            as: "chat"                    
        }              
    },           
    {
        $match: { userCode: mongoose.Types.ObjectId(msg.userCode)}
    },
    {
        $project: {chatroomCode:1, enquiryId: 1, "enquiry.productName": 1, "enquiry.product_des": 1, "users.firstName": 1, "users.lastName": 1, "users.userCode": 1, "users._id": 1, "users.emailId": 1, "users.roleId": 1}
    },
    {
        $sort: {
          'chat.createdAt': -1,
        }
    }
],  async function(err, records){  
    var result = []

     for(let i=0; i<records.length; i++){
        const unseenCode = await chatModel.find({chatroomId: records[i]._id, senderId: {"$ne": msg.userCode}, isSeen: "0"}).count();
        records[i].unseenCount = unseenCode;
        result.push(records[i]);
     }	
        const chatroomObj = {chatroom: result, showid: msg.userCode}
        socket.broadcast.emit('receiveChatRoom', chatroomObj);

   });
})

// For notification 

socket.on('notification', async (data) => {
    const pushObj  = await pushnotificationModel.find({showFor: mongoose.Types.ObjectId(data.id)}, {message: 1, redirectTo: 1, _id: 0, showFor: 1})
    const notificationData = {notification: pushObj, show: data.id}
    socket.broadcast.emit('receiveNotification', notificationData);
})

socket.on('typing', (data)=>{
    if(data.typing==true)
       io.emit('display', data)
    else
       io.emit('display', data)
})
});


