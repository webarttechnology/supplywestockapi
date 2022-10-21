const API_KEY = '86af389d8214772bf33b612980fa9410-c76388c3-25c2d93f';
const DOMAIN = 'sandboxfa808bcc22fe4aa5a4dc14b13ceb3c40.mailgun.org';

const formData = require('form-data');
const Mailgun = require('mailgun.js');




const sendMail = (req, res) => {
    const mailgun = new Mailgun(formData);
    const client = mailgun.client({username: 'api', key: API_KEY});

    const messageData = {
        from: 'Excited User <me@sandboxfa808bcc22fe4aa5a4dc14b13ceb3c40.mailgun.org>',
        to: 'sankar.webart@gmail.com',
        subject: 'Hello',
        text: 'Testing some Mailgun awesomeness!'
      };
      
      client.messages.create(DOMAIN, messageData)
      
 .then((res) => {
   console.log(res);
 })
 .catch((err) => {
   console.error(err);
 });
}


module.exports = {
    sendMail: sendMail
}