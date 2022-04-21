const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
   service:'gmail',
    auth:{
        user : process.env.EMAIL,
        pass :process.env.PASSWORD 
    },
});


async function mailSending(mailData){
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


module.exports={
    mailSending
}