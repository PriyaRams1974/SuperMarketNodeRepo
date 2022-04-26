const nodemailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');
const {join} = require('path');
const sgMail=require("@sendgrid/mail");
sgMail.setApiKey("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");



// const transporter = nodemailer.createTransport({
//    service:'gmail',
//     auth:{
//         user : process.env.EMAIL,
//         pass :process.env.PASSWORD 
//     },
// });

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth:{
        user : process.env.EMAIL,
        pass :process.env.PASSWORD 
    },
});


async function mailSending(mailData){
    console.log("mailSending",mailData)

    try{
    transporter.sendMail(mailData,(err,data)=>{
        if(err)
        console.log('mail not sent'+err.message);
        else
        console.log('Mail sent');
    })
}catch(err){
    console.log(err.message);
    process.exit(1);
}

}

async function mailEjsSending(mailData){

    try {
        console.log(mailData.attachments)
        const data = await ejs.renderFile(join(__dirname,'../templates/', mailData.fileName), mailData, mailData.details)
        const mailDetails = {
            from:mailData.from,
            to:mailData.to,
            subject:mailData.subject,
            attachments: mailData.attachments,
            html:data
        }
        transporter.sendMail(mailDetails, (err, data)=>{
            if(err){
                console.log("err", err.message)
            }else{
                console.log("Mail sent successfully");
                return 1
            }
        })
        
    } catch (error) {
        console.log(error.message)
        process.exit(1);
    }
}

async function SendGridmailSending(compose){
    console.log("ok")
    try{
        
        const data= await ejs.renderFile(join(__dirname,'../templates/',compose.fileName),compose,compose.details)
        console.log(__dirname)
        const mailData= {
            to:compose.to,
            from:compose.from,
            subject:compose.subject,
             html:data
        }
        // sgMail.send(mailData)

        sgMail.send(mailData,(err,data)=>{
           
            if(err){ 
                console.log("err",err.message)
             }else{
                console.log("Mail sent using sendgrid successfully")
                return 1
             }
        })
    }catch(error){
        console.log(error.message)
        process.exit(1);
    }
}

module.exports = {
    mailSending: mailSending,
    mailEjsSending: mailEjsSending,
    SendGridmailSending:SendGridmailSending
}