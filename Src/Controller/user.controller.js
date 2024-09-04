const UserServices = require("../services/user.service");
const userService = new UserServices();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { mailMessage } = require("../helpers/mail");
require('dotenv').config();

// Register User
exports.signupUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (user) {
      res.status(400).json({ message: "User Already Registered..." });
    }

    let hashpassword = await bcrypt.hash(req.body.password, 10);
    
    const otp = crypto.randomInt(100000, 999999);

    // Set OTP expiration time to 10 min from now
     const otpExpires = new Date(Date.now() + 600000);
    
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
    <h1>Sing-up email code</h1>
    <h2 style="color: #1f2937; font-size: 20px; font-weight: bold;">Hello...</h2>
    <h2 style="color: #1f2937; font-size: 16px; font-weight: bold;">Thank you for Registering...!</h2>
    <p style="color: #4b5563; font-size: 16px;">Please confirm your email by clicking the link below:</p>
    <a href="${confirmationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 4px;">Confirm your email</a>
    <p style="color: #4b5563; font-size: 16px;">Please click the below link and conform your registration. </p>

    <h3 style="margin-top: 30px; color: #1f2937; font-size: 20px;">Your OTP : ${otp}</h3>
    <p style="color: #4b5563; font-size: 16px;">This code is valid for 10 minutes. Don't share the code with anyone.</p>
    
</body>
</html>
`,
    };

    await mailMessage(confirmationMail);
    res.status(201).json({ user , message : "User Registered SuccessFully...Please check your email to confirm your account." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error..${console.error()}` });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    let user = await userService.getUser({email: req.body.email});
    // console.log(user);
    if (!user) {
      return res.status(400).json({ message: `Email Not Found...` });
    }
    let checkPassword = await bcrypt.compare(req.body.password, user.password);
    if (!checkPassword) {
      return res.status(401).json({ message: `Password Not Match...` });
    }
    let token = jwt.sign({ userId: user._id }, prosee.env.KEY);
    console.log(token);
    res.status(200).json({ token, message: `User Login SuccesFully..` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error...${console.error()}` });
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
