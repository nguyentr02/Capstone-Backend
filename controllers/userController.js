const { User } = require('../models/userModel');
const { registerUser, loginUser } = require('../services/userServices');

const registerUserCont = async (req, res) => {
    try {
        const newUser = await registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

const loginUserCont = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await loginUser(email, password);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { registerUserCont, loginUserCont };

