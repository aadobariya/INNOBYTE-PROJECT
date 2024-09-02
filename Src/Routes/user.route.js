const express = require('express');
const userRoute = express.Router();
const {userVerifyToken} = require('../Helpers/userVerifyToken');
const userController = require("../Controller/user.controller");

const {
     signupUser,
     loginUser,
     getUserProfile,
     verifyOtp
} = require("../Controller/user.controller");

// Register user
userRoute.post('/signup' , signupUser);

// Login user
userRoute.post('/login' , loginUser );

// Get User Profile
userRoute.get('/profile' , userVerifyToken , getUserProfile);

// Otp confirmation
userRoute.post('/verify-otp',userController.verifyOtp);


module.exports = userRoute;
