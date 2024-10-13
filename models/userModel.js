const db = require('./db');
const { DataTypes } = require('sequelize');

// Define the User model
const User = db.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phone_no: { type: DataTypes.STRING },
    role: {
        type: DataTypes.ENUM('participant', 'organizer', 'admin'),
        defaultValue: 'participant',
    },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
},
    {
        hooks:
        // Hash the password before saving the user
        {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            }
        }
    });

module.exports = User;