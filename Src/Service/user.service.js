const User = require('../Model/user.model');

module.exports = class UserServices {
    // Add User
    addNewUser = async(body) => {
        return await User.create(body);
    };
    
    // Get User
    getUser = async(body) => {
        return await User.findOne(body);
    }

    // Get Specific User
    getSpecificUser = async(id) => {
        return await User.findById(id);
    }
};
