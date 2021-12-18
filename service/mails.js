const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox98563cdfa82742bba2902cca5d70dcef.mailgun.org';
const mg = mailgun({apiKey: `fb058a591fb538a6de04f314a84698a0-8ed21946-5151ab48`, domain: DOMAIN});

const sendMail=({ name,description })=>{
    const data = {
        from: 'vijayethuraj@gmail.com',
        to: 'veera@orennow.com',
        subject: 'Order Status - Oren',
        text: `Sucessfuly order placed, ProductName: ${name}, Description: ${description}`
    };
    return mg.messages().send(data).then(res=>{
        return res;
    },(err)=>{
        return err;
    })
}

module.exports = {sendMail};
