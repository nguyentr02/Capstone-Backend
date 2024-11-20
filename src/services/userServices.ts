const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/userModel');

const registerUser = async (userData) => {
    try {
        // Check if user exists
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const newUser = await UserModel.create(userData);
        return newUser;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

const loginUser = async (email, password) => {
    try {
        // Find user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await UserModel.verifyPassword(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return token;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

module.exports = { registerUser, loginUser };

// const registerUser = async (userData) => {
//     const { first_name, last_name, email, phone_no, role, password } = userData;

//     try {
//         // Check if the user already exists
//         const existingUser = await User.findOne({ where: { email } });
//         if (existingUser) {
//             throw new Error('User with this email already exists');
//         }

//         // Create a new user
//         const newUser = await User.create({
//             first_name,
//             last_name,
//             email,
//             phone_no,
//             role,
//             password_hash: password // The password will be hashed by the beforeCreate hook
//         });

//         return newUser;
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }

// const loginUser = async (userData) => {
//     const { email, password } = userData;

//     // Check if the user exists
//     let user = await User.findOne({ where: { email } });
//     if (!user) {
//         throw new Error('Invalid credentials');
//     }

//     // Check if the password is correct
//     const isMatch = await bcrypt.compare(password, user.password_hash);
//     if (!isMatch) {
//         throw new Error('Invalid credentials');
//     }

//     // Generate and return a JWT token
//     const payload = {
//         user: {
//             user_id: user.user_id,
//             role: user.role
//         }
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

//     return token;
// };

// module.exports = { registerUser, loginUser };
