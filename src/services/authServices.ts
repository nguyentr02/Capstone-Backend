import { prisma } from "../config/prisma";
import { RegisterDto, LoginDto, AuthResponse, TokenResponse, RefreshTokenPayload } from "../types/authTypes";
import { AuthenticationError, ValidationError} from "../utils/errors";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    
    //------ Utility functions
    private static generateAccessToken(user: any): string{
        return jwt.sign(
            {user: user.user_id, role: user.role},
            process.env.JWT_SECRET!,
            {expiresIn: "1h"} 
        )
    }

    private static generateRefreshToken(userId: number): string{
        return jwt.sign(
            {userId},
            process.env.REFRESH_TOKEN_SECRET!,
            {expiresIn: "7d"} 
        )
    }

    // 01 - Register a new user
    static async registerUser(data: RegisterDto): Promise<AuthResponse & {refreshToken: string}> {
        const { email, password, firstName, lastName, phoneNo } = data;
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });
        
        if (existingUser) {throw new ValidationError('Email already registered');}

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: 'PARTICIPANT' // Default role
            }
        });

        // Generate JWT tokens
        const accessToken = this.generateAccessToken(newUser);
        const refreshToken = this.generateRefreshToken(newUser.id);

        // Destructure password from user object    
        const { password: userPassword, ...userWithoutPassword } = newUser;

        // Return the user without password and the token
        return { 
            user: userWithoutPassword,
            accessToken,
            refreshToken
         };
    }

    // 02 - Login a user
    static async loginUser(data: LoginDto): Promise<AuthResponse & {refreshToken: string}> {
        
        // Extract email and password from data
        const {email, password} = data;

        // Find the user
        const user = await prisma.user.findUnique({ where: { email : email } });
        if (!user) {throw new AuthenticationError('Invalid credentials');}

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {throw new AuthenticationError('Invalid credentials');}

        // Generate JWT tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user.id);

        // Destructure password from user object
        const { password: userPassword, ...userWithoutPassword } = user;

        // Return the user without password and the token
        return { 
            user: userWithoutPassword, 
            accessToken, 
            refreshToken
        };
    }

    // 03 - Refresh token
    static async refreshToken(token: string): Promise<TokenResponse & {refreshToken: string}> {
        try {
            // Verify the token
            const payload = jwt.verify(
                token, 
                process.env.REFRESH_TOKEN_SECRET!
            ) as RefreshTokenPayload;
            
            // Find the user
            const user = await prisma.user.findUnique({ where: { id: payload.user_id } });
            if (!user) {throw new AuthenticationError('Invalid refresh token');}

            // Generate new tokens
            const accessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user.id);

            return { accessToken, refreshToken: newRefreshToken };

        }
        catch (error){
            throw new AuthenticationError('Invalid refresh token');
        }
    }


}