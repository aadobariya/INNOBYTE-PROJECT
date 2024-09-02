const UserServices = require("../Service/user.service");
const userService = new UserServices();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { mailMessage } = require("../Helpers/mail");

// Register User
exports.signupUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (user) {
      res.status(400).json({ message: "User Already Registered..." });
    }
    let hashpassword = await bcrypt.hash(req.body.password, 10);
    // let token = jwt.sign( {email : req.body.email} , "User");
    // console.log(token);
    // res.status(201).json({ token, message: "User  SuccessFully..." });
    const otp = crypto.randomInt(100000, 999999);

    // Set OTP expiration time to 1 hour from now
     const otpExpires = new Date(Date.now() + 600000);
    // console.log(hashpassword);
    user = await userService.addNewUser({
      ...req.body,
      password: hashpassword,
      otp, 
      otpExpires
    });

    // Generate Email Confirmation
    const confirmationLink = `${req.protocol}://${req.get(
      "host"
    )}/api/confirm-email/`;

    let confirmationMail = {
      from: process.env.MAIL_USER,
      to: req.body.email,
      subject: "Confirmation Mail",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation</title>
</head>
<body>
    <h2>Thank you for registering...!</h2>
    <p>Please confirm your email by clicking the link below:</p>
    <a href="${confirmationLink}">Confirm your email</a>
    <h3>${otp}</h3>
    <p>This OTP will expire in 10 Minites.</p>
</body>
</html>
`,
    };

    await mailMessage(confirmationMail);
    res.status(201).json({ user, message : "User Registered SuccessFully...Please check your email to confirm your account." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error..${console.error()}` });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (!user) {
      res.status(400).json({ message: "Email Not Found..." });
    }
    let checkpassword = await bcrypt.compare(req.body.password, user.password);
    // console.log(checkpassword);
    if (!checkpassword) {
      res.status(400).json({ message: "Password Not Match..." });
    }
    let token = jwt.sign( {userId: req.body._id} , "User");
    res.status(201).json({token, message: `User login successfully... `})
    
  } catch (error) {
    console.log(error);
    res .status(500)
      .json({ message: `Internal Server Error..${console.error()}` });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    let user = await userService.getSpecificUser(req.query.userId);
    // console.log(user);
    if (!user) {
      res.status(400).json({ message: "User's Profile Not Found..." });
    }
    res.status(200).json({ user, message: "User's Profile Information..." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error..${console.error()}` });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userService.getUser({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Confirm the user and remove the OTP fields
    user.isConfirmed = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};                                                            
