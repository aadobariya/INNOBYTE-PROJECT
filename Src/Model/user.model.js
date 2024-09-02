const mongoose = require ('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required:true, 
        minlength: 8,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, /@gmail.com|@outlook.com/,'Fill Valid Email Address...'],
    },
    otp: {
        type : String,
        
    },
    otpExpires: {
        type: Date,
        
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
{
    versionkey: false,
    timestamps: true
});

module.exports = mongoose.model('Users' , userSchema); 