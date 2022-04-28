const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const {totp} = require('otplib');
const fast2sms = require('fast-two-sms');
require('dotenv').config()
// imported schema
const userSchema = require('../models/usermodel');
const {authSchema} = require('../models/joiValidation.js');
const MailSending = require('../middleware/email.js');
const OTPSending = require('../middleware/sms.js');

const ejs = require('ejs');
require('dotenv').config();
    router.post('/signUp', async(req,res)=>{

    try {
        // const resultBody = await authSchema.validateAsync(req.body)       
        // console.log("result.......",resultBody);
        const username = req.body.username;
        const email = req.body.email;
        const mobileNumber = req.body.mobileNumber;
        
        if(username){

            if(username.search(/\d/)==-1){
                return res.json({status:"Failure",message:'username must contain atleast one number'})
        }else if(username.search(/^[A-Za-z0-9]+$/)){
                return res.json({status:"Failure",message:'username must not contain any special character'})
        }else if(username.search(/[a-zA-Z]/)==-1){
                return res.json({status:"Failure",message:'username must contain atleast one alphabet character'})
            }
            let usernameDetail = await userSchema.findOne({'username': username}).exec()
            if(usernameDetail){
                return res.json({status: "failure", message: 'username already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Username not found'})
        }

        if(mobileNumber){
            let usermobileNumberDetail = await userSchema.findOne({'mobileNumber': mobileNumber}).exec()
            if(usermobileNumberDetail){
                return res.json({status: "failure", message: 'mobileNumber already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the mobileNumber'})
        }

        if(email){
            let useremailDetail = await userSchema.findOne({'email': email}).exec()
            if(useremailDetail){
                return res.json({status: "failure", message: 'email already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the email'})
        }

        let user = new userSchema(req.body);
        console.log("before hashing")
        console.log(user.password);
        if(req.body.password){
            let password = req.body.password;
            let salt = await bcrypt.genSalt(10);
            // console.log("_".repeat(2))
            user.password = bcrypt.hashSync(password, salt);
            console.log("after hashing")
            console.log(user.password);
        }
            const secrect = 'secrectOTPkey_sample'
            const token = totp.generate(secrect)
            console.log(token)
            console.log(secrect)
            user.MobileOTP = token
        var result = await user.save();
        const response = fast2sms.sendMessage({authorization : process.env.SMSAPIKEY , message : 'verify your mobile no OTP is '+token ,  numbers : ['9445376463']}) 
        // let link = `http://192.168.1.26:7070/api/v2/users/VerifiedUserApi?uuid=${user.uuid}`
        let link = `http://127.0.0.1:7070/api/v2/users/VerifiedUserApi?uuid=${user.uuid}`

        const toMail = user.email;
        const subject = "Account Activation Link";
        const mailData = {
            from: process.env.EMAIL,
            to: toMail,
            subject: subject,
            // text: text
            // html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><p>Click here ${link}`
            html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><a href= ${link}>Click here</a><p>Thank you</p>`

        }
        let data = await MailSending.mailSending(mailData)
        console.log("MAIL RESPONSE ",data)
        // await mailService(emailDetail)
        return res.status(200).json({status: "success", message: "user details added successfully", data: result})    
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
});

// login
// router.post('/login',authVerify, async(req,res)=>{
    router.post('/login', async(req,res)=>{

    try {
        let username = req.body.username;
        let password = req.body.password;
        let userDetails;
        let userDetails1 = await userSchema.findOne({username: username}).select('-password -_id').exec()
        console.log(userDetails1)
        if (!userDetails1.verifiedUser) {
            console.log("Login", "user not verified")
            return res.status(400).json({status: "failure", message: "user not verified. Kindly activate your account from the link in your registered email"});
        }else {
        if(username){
            userDetails = await userSchema.findOne({username: username}).exec()
            if(!userDetails){
                return res.status(400).json({status: "failure", message: "please signup first"});
            }
        }else{
            return res.status(400).json({status: "failure", message: "Please enter the username"})
        }
        if(userDetails){
            let isMatch = await bcrypt.compare(password, userDetails.password)
            if(userDetails.firstLoginStatus !== true){
               await userSchema.findOneAndUpdate({uuid: userDetails.uuid}, {firstLoginStatus: true}, {new:true}).exec();
            }
            let payload = {uuid: userDetails.uuid, role: userDetails.role}
           
            if(isMatch){
                var userData = userDetails1.toObject()
                console.log(userData);
                let jwttoken = jwt.sign(payload, process.env.secrectKey)
                userData.jwttoken = jwttoken

                return res.status(200).json({status: "success", message: "Login successfully", data: userData})
            }else{
                return res.status(200).json({status: "failure", message: "Login failed"})
            }
        }
    }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }

})

// logout
router.post("/logout/:uuid", async(req,res)=>{
    try {
        let date1 = moment().toDate();
        console.log(date1)

 // Function to convert
 // 24 Hour to 12 Hour clock
  const formatHour = (input) => {
    if (input > 12) {
      return input - 12;
    }
    return input;
  };

let date = new Date();
let month=  date.getMonth()+1;
let d=(date.getFullYear().toString())+"-"+(month.toString())+"-"+(date.getDate().toString())+"-"+(date.getHours().toString())+":"+(date.getMinutes().toString());


//         // await userSchema.findOneAndUpdate({uuid: req.params.uuid}, {lastedVisited: date,loginStatus: false}, {new:true}).exec()
        await userSchema.findOneAndUpdate({uuid: req.params.uuid}, {lastedVisited: d,loginStatus: false}, {new:true}).exec()

        return res.status(200).json({status: "success", message: "Logout success"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})


// login
router.put('/resetpassword', async(req,res)=>{
    try {
        let username = req.body.username;
        let password = req.body.password;
        let newpassword = req.body.newpassword;
        let userDetails;
        let userDetails1 = await userSchema.findOne({username: username}).select('-password -_id').exec()
        console.log(userDetails1)
        
        if(username){
            userDetails = await userSchema.findOne({username: username}).exec()
            if(!userDetails){
                return res.status(400).json({status: "failure", message: "please signup first"});
            }
        }else{
            return res.status(400).json({status: "failure", message: "Please enter the username"})
        }
        if(userDetails){
            let isMatch = await bcrypt.compare(password, userDetails.password)
            
            let payload = {uuid: userDetails.uuid, role: userDetails.role}
           
            if(isMatch){
            let salt = await bcrypt.genSalt(10);
            // console.log("_".repeat(2))
            console.log(newpassword)
            let updatedpassword = bcrypt.hashSync(newpassword, salt);
            console.log("after hashing")
            console.log(updatedpassword);
            await userSchema.findOneAndUpdate({uuid: userDetails.uuid}, {password: updatedpassword}, {new:true}).exec();

                var userData = userDetails1.toObject()
                console.log(userData);
                let jwttoken = jwt.sign(payload, process.env.secrectKey)
                userData.jwttoken = jwttoken

                return res.status(200).json({status: "success", message: "Password reset successfully", data: userData})
            }else{
                return res.status(200).json({status: "failure", message: "Password reset failed"})
            }
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})

router.post("/mailSendingApi", async(req, res)=>{
    try {
        const toMail = req.body.toMail;
        const subject = req.body.subject;
        const text = req.body.text;
        const mailData = {
            from: process.env.EMAIL,
            to: toMail,
            subject: subject,
            text: text
        }
        let data = await MailSending.mailSending(mailData)
         return res.status(200).json({status: "success", message: "Mail sent successfully"})
          
    }catch(err){
        res.json({status:'failure',message:err.message})
    }
})
router.post("/mailSendingHtmlApi", async(req, res)=>{
    try {
        // let link = "https://w3schools.com/html"

        let useruuid = req.body.uuid
        let useremail = req.body.email


        let link = `http://127.0.0.1:7070/api/v2/users/VerifiedUserApi?uuid=${useruuid}`

        // const toMail = req.body.toMail;
        const toMail = useremail;
        const subject = req.body.subject;
        const text = req.body.text;
        const mailData = {
            from: process.env.EMAIL,
            to: toMail,
            subject: subject,
            // text: text
            // html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><p>Click here ${link}`
            html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><a href= ${link}>Click here</a><p>Thank you</p>`

        }
        let data = await MailSending.mailSending(mailData)
         return res.status(200).json({status: "success", message: "Mail sent successfully"})
          
    }catch(err){
        res.json({status:'failure',message:err.message})
    }
})

router.post("/mailSendingEJSApi", async(req, res)=>{
    try {
        let link = "https://w3schools.com/html"
        const toMail = req.body.toMail;
        const subject = req.body.subject;
        // const text = req.body.text;
        const mailData = {
            from: process.env.EMAIL,
            to: toMail,
            subject: subject,
            // text: text
            // html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><p>Click here ${link}`
            // fileName: 'SampleEjs.ejs',
            fileName: 'confirmationEmail.ejs',

            attachments:
                {
                    filename:'sample.pdf',
                    filePath:'../mailpdf/sample.pdf'               
                }
            ,
            details:{
                title: "APPLICATION FORM",
                date: new Date(),
                link: "https://www.w3schools.com/html/tryit.asp?filename=tryhtml_default"
            }
        }
        await MailSending.mailEjsSending(mailData).then(data=>{
            return res.status(200).json({status: "success", message: "Mail sent successfully"}) 
        }).catch((error)=>{
            return res.status(400).json({status: "failure", message: "Mail sent failed"})
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})

router.get("/VerifiedUserApi", async(req, res)=>{
    try {
        const UuidToBeVerified = req.query.uuid;
        let Details = {}
        let userDetails1 = await userSchema.findOne({uuid: UuidToBeVerified}).select('-password -_id').exec()
        if (userDetails1.verifiedUser) {
            //old user
            Details = {details: {
                title: "User already Verified",
                date: new Date(),
            }
        }      
    }else {
        //new user 
            Details = {details: {
                title: "User Verified",
                date: new Date(),
            }
        }
        let result = await userSchema.findOneAndUpdate({uuid: UuidToBeVerified}, {verifiedUser: true}, {new:true}).exec();

    }
            res.render("EmailVeryfiedEjs.ejs",Details)
        // }
        // console.log("result ==>",result)
        
        //  return res.status(200).json({status: "success", message: "Mail sent successfully"})
          
    }catch(err){
        res.json({status:'failure',message:err.message})
    }
})



router.post("/VerifiedMobileApi", async(req, res)=>{
    try {
        const otpToBeVerified = req.body.otp;
        const mobileno = req.body.mobileno;
        let userDetails1 = await userSchema.findOne({mobileNumber:mobileno}).select('-password -_id').exec()
        if (userDetails1){
        if (userDetails1.MobileOTP == otpToBeVerified) {
            let result = await userSchema.findOneAndUpdate({mobileNumber:mobileno}, {MobileVerifiedStatus: true}, {new:true}).exec();
            console.log("result ==>",result)
            return res.status(200).json({status: "success", message: "Mobile number verified successfully"})
        } else {
            console.log("result ==> OTP mismatch")
            return res.status(400).json({status: "faliure", message: "Invalid OTP"})
        }
    }else{
        console.log("result ==> OTP mismatch")
            return res.status(400).json({status: "faliure", message: "Invalid mobileno"})
    }
    }catch(err){
        res.json({status:'failure',message:err.message})
    }
})

//api for mailSending
router.post('/sendMailSendgrid',async(req,res)=>
{ 
    try{ 
        const toMail = req.body.toMail; 
        const subject = req.body.subject; 
        const text = req.body.text; 
        const compose={ to:toMail, 
            from:process.env.SENDGRIDEMAIL, 
            subject:subject, 
            fileName:'confirmationemail.ejs', 
            html: '<h1>This is Heading</h1>', 
            attachments:{ filename:'sample.pdf', 
            filePath:'../mailpdf/sample.pdf' } 
        }
        let mailData = await MailSending.SendGridmailSending(compose)
        console.log("compose:...",compose)
       //if(mailData===1){
         return res.status(200).json({status:'success',message:"mail sent successfully"})
       //}//
    //    }else{
    //        return res.status(400).json({status:'Failure',message:'mail not sent'})
    //    }
    }catch(error){
        console.log(error.message);
       // return res.status(500).json({status:'success',message:error.message})
    }
})





// export async function mailService(mailDetails){
//         let useruuid = mailDetails.useruuid
//         let useremail = mailDetails.useremail
//         let emaiSubject = mailDetails.subject
//         console.log("email data ==>mailService",mailDetails)
//         // 192.168.1.26
//         // let link = `http://127.0.0.1:7070/api/v2/users/VerifiedUserApi?uuid=${useruuid}`
//         let link = `http://192.168.1.26:7070/api/v2/users/VerifiedUserApi?uuid=${useruuid}`

//         const toMail = useremail;
//         const subject = emaiSubject;
//         const mailData = {
//             from: process.env.EMAIL,
//             to: toMail,
//             subject: subject,
//             // text: text
//             // html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><p>Click here ${link}`
//             html: `<h1>This is a Heading</h1><p>This is a Paragraph</p><a href= ${link}>Click here</a><p>Thank you</p>`

//         }
//         let data = await MailSending.mailSending(mailData)
//         console.log("MAIL RESPONSE ",mailDetails)

// }


module.exports = router;