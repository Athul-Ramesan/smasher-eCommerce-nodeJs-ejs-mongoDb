const sendMail = require('../validators/nodeMailer')

const generateOtp = () => {

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    return otp
}
module.exports = {
    
    sendOtp :async (email)=>{
        const generatedOtp = await generateOtp();
        sendMail.sendOtpVerificationEmail(generatedOtp, email);
        console.log(email);
        console.log("otp :", generatedOtp);
    }
}