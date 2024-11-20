const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {
    
    static async findByEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM User WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { first_name, last_name, email, phone_no, role, password } = userData;
        
        try {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const [result] = await pool.query(
                `INSERT INTO User (first_name, last_name, email, phone_no, role, password, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [first_name, last_name, email, phone_no, role || 'participant', hashedPassword]
            );
            
            return {
                user_id: result.insertId,
                first_name,
                last_name,
                email,
                phone_no,
                role
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = UserModel;


// const { db } = require('../config/database');
// const { DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');

// // Define the User model
// const User = db.define('User', {
//     user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     first_name: { type: DataTypes.STRING },
//     last_name: { type: DataTypes.STRING },
//     email: { type: DataTypes.STRING, unique: true, allowNull: false },
//     phone_no: { type: DataTypes.STRING },
//     role: {
//         type: DataTypes.ENUM('participant', 'organizer', 'admin'),
//         defaultValue: 'participant',
//     },
//     password_hash: { type: DataTypes.STRING, allowNull: false },
//     created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
// },
//     {
//         hooks:
//         // Hash the password before saving the user
//         {
//             beforeCreate: async (user) => {
//                 const salt = await bcrypt.genSalt(10);
//                 user.password_hash = await bcrypt.hash(user.password_hash, salt);
//             },
//             beforeUpdate: async (user) => {
//                 if (user.changed('password_hash')) {
//                     const salt = await bcrypt.genSalt(10);
//                     user.password_hash = await bcrypt.hash(user.password_hash, salt);
//                 }
//             }
//         }
//     });

// module.exports = User;