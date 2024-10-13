const { User } = require('../models/userModel');
const userService = require('../services/userServices');

const registerUser = async (req, res) => {
    try {
        const newUser = await userService.registerUser(req.body);

        // Send back a success response if registration is successful
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const token = await userService.loginUser(req.body);

        // Send back the token if login is successful
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };

