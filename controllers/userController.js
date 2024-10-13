const { User } = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, phone_no, role, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        user = await User.create({ first_name, last_name, email, phone_no, role, password });

        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate and return a JWT token
        const payload = {
            user: {
                user_id: user.user_id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
            if (error) throw error;
            res.status(200).json({ token });
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { registerUser, loginUser };

