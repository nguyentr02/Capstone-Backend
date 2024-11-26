import { prisma } from "../config/prisma";
import { RegisterDto, LoginDto, AuthResponse, JwtPayload } from "../types/auth";
import { AuthenticationError, ValidationError} from "../utils/errors";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    
    // Register a new user
    static async registerUser(data: RegisterDto): Promise<AuthResponse> {
        const { email, password, firstName, lastName, phoneNo } = data;
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        // If user exists, throw an error
        if (existingUser) {
            throw new ValidationError('Email already registered');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: 'PARTICIPANT' // Default role is participant
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { user_id: newUser.id, email, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        const { password: userPassword, ...userWithoutPassword } = newUser;

        // Return the user without password and the token
        return { user: userWithoutPassword, token };
    }

    // Login a user
    static async loginUser(data: LoginDto): Promise<AuthResponse> {
        
        // Extract email and password from data
        const {email, password} = data;

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        // If user does not exist, throw an error
        if (!user) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If password does not match, throw an error
        if (!passwordMatch) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.id, email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );
        
        const { password: userPassword, ...userWithoutPassword } = user;

        // Return the user without password and the token
        return { user: userWithoutPassword, token };
    }

    // get user profile with related data
    static async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                registrations: {
                    include: {
                        event: true,
                        ticketPurchases: true
                    }
                }
            }
        });

        if (!user) {
            throw new ValidationError('User not found');
        }

        const { password: userPassword, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

}