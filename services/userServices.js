const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models/userModel');


const registerUser = async (userData) => {
    const { first_name, last_name, email, phone_no, role, password } = userData;

    //Check if the user already exists
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await User.create({ first_name, last_name, email, phone_no, role, password_hash: hasedPassword });

    return newUser;
}

const loginUser = async (userData) => {
    const { email, password } = userData;

    // Check if the user exists
    let user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Generate and return a JWT token
    const payload = {
        user: {
            user_id: user.user_id,
            role: user.role
        }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

    return token;
};

module.exports = { registerUser, loginUser };
