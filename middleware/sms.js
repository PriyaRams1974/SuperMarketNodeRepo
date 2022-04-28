const {totp} = require('otplib')


function otpsend(type){
 if (type == "Istsend"){
   const secrect = 'secrectOTPkey_sample'
   const token = totp.generate(secrect)
   console.log(token)
   console.log(secrect)

} else if(type == "resend"){
    const secrect = 'secrectOTPkey_sample'
    const token = totp.generate(secrect)
    console.log(token)
    console.log(secrect)
   }
}

function verifyOTP(){
    const secret = 'secretOTPkey_sample'
    const token = totp.generate(secret)
    console.log(token)
    console.log(secret)
    // console.log(otp)
    const issame = totp.check(token, secret)
}

module.exports = {
    otpsend:otpsend,
    verifyOTP:verifyOTP

}