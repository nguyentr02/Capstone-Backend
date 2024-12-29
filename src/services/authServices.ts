import { prisma } from "../config/prisma";
import { User} from '@prisma/client';
import { RegisterDto, LoginDto, AuthResponse, JwtPayload } from "../types/authTypes";
import { AuthenticationError, ValidationError} from "../utils/errors";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    
    private static generateAccessToken(user: User): string {
        return jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }  // Short lived
        );
    }

    private static generateRefreshToken(userId: number): string {
        return jwt.sign(
            { userId },
            process.env.REFRESH_TOKEN_SECRET!,  // Use different secret
            { expiresIn: '7d' }
        );
    }

    // Register a new user
    static async registerUser(data: RegisterDto): Promise<AuthResponse> {
        const { email, password, firstName, lastName, phoneNo } = data;
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: {email}});
        if (existingUser) throw new ValidationError('Email already registered');         // If user exists, throw an error

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

         // Generate JWT tokens
         const accessToken = this.generateAccessToken(newUser);
         const refreshToken = this.generateRefreshToken(newUser.id);

        const { password: userPassword, ...userWithoutPassword } = newUser;

        // Return the user without password and the token
        return { user: userWithoutPassword, accessToken, refreshToken };
    }

    // Login a user
    static async loginUser(data: LoginDto): Promise<AuthResponse> {
        
        // Extract email and password from data
        const {email, password} = data;

        // Find the user
        const user = await prisma.user.findUnique({ where: { email: email } });        
        if (!user) throw new AuthenticationError('Invalid credentials');

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new AuthenticationError('Invalid credentials'); // If password does not match, throw an error

        // Generate JWT tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user.id);

        // Remove password from user object
        const { password: userPassword, ...userWithoutPassword } = user;

        // Return the user without password and the token
        return { user: userWithoutPassword, accessToken, refreshToken};
    }

    static async refreshToken(refreshToken: string) {
        try {

            //Verify refresh token
            const decoded = jwt.verify(
                refreshToken, 
                process.env.REFRESH_TOKEN_SECRET!
            ) as JwtPayload;

            // Find the user
            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.user_id
                }
            });

            if (!user) throw new AuthenticationError("User not found");

            // Generate JWT tokens
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user.id);

            return { newAccessToken, refreshToken: newRefreshToken };
        }
        catch (err) {
            throw new AuthenticationError('Error refreshing token')
        }
    }

}