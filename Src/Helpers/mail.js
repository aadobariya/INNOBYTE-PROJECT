const nodemailer = require('nodemailer');

exports.mailMessage = async(msg) => {
    try {
        if(!msg.subject){
            throw new Error("Email must have a subject");
        }
        let transporter = nodemailer.createTransport({
            service:"gmail",
            secure:false,
            port: 587,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail(msg);
        console.log("Email send SuccessFully..." , info.response);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error..${console.error()}`});
    }
};