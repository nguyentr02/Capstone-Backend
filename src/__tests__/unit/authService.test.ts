import request from 'supertest';
import app from '../../app';

import { AuthService } from "../../services/authServices";
import { prisma } from "../../config/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../config/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        }
    }
}));

describe('AuthService', () => {

    // Setting test conditions before each test
    beforeEach(() => {
        jest.clearAllMocks();
    })

    describe('register', () => {

        // Test data for registration
        const registerData = {
            email: "test@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
            phoneNo: "0123456789"
        }

        // Test 1: Registering a new user
        it('should register a new user', async() => {

            // Mock hashed password
            const hashedPassword = 'hashedPassword123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            // Mock user
            const mockUser = {
                id: 1,
                ...registerData,
                password: hashedPassword,
                role: 'PARTICIPANT',
                createdAt: new Date()
            };
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            // Mock tokens
            (jwt.sign as jest.Mock).mockReturnValue('mockToken123');
            (jwt.sign as jest.Mock).mockReturnValue('mockToken123');

            // Call the service method
            const result = await AuthService.registerUser(registerData);

            //Verify the results
            expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10); // Check if password was hashed
            expect(prisma.user.create).toHaveBeenCalledWith({ 
                data: {
                    ...registerData,
                    password: hashedPassword,
                    role: 'PARTICIPANT'
                }
            }); 

            // Check the returned data
            expect(result).toHaveProperty('user');
            expect(result.user).toEqual(expect.objectContaining({
                id: mockUser.id,
                email: registerData.email,
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                phoneNo: registerData.phoneNo,
                role: mockUser.role
            }));

            // expect(result).toHaveProperty('accessToken');
            // expect(result).toHaveProperty('refreshToken');
            // expect(result.accessToken).toBe(mockToken);
            // expect(result.refreshToken).toBe(mockToken);
        });

        //Test 2: Error handling for existing user
        it('should throw an error if the email already exists', async () => {
            // Mock findUnique
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({id : 1});

            // Expect error
            await expect(AuthService.registerUser(registerData))
                .rejects
                .toThrow('Email already registered');
        });
    });

    // Test 2: Tests for login functionality
    describe('login', () => {
        it('should successfully login a user with valid credentials', async () => {
            // Setup mocks
            const loginData = { email: 'test@example.com', password: 'password123' };
            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                id: 1,
                email: loginData.email,
                password: hashedPassword,
                role: 'PARTICIPANT'
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockResolvedValue('mockToken123');

            // Call service
            const result = await AuthService.loginUser(loginData);

            // Assertions
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: loginData.email }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, hashedPassword);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('should throw an error with invalid credentials', async () => {
            // Setup mocks
            const loginData = { email: 'test@example.com', password: 'wrongPassword' };
            const mockUser = {
                id: 1,
                email: loginData.email,
                password: 'hashedPassword123',
                role: 'PARTICIPANT'
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Assertions
            await expect(AuthService.loginUser(loginData))
                .rejects
                .toThrow('Invalid credentials');
        });
    });

    // Test 3: Tests for generating access token
    describe('refreshToken', () => {
        it('should generate new tokens with a valid refresh token', async () => {
            // Setup mocks
            const mockToken = 'validRefreshToken';
            const mockPayload = { user_id: 1 };
            const mockUser = { id: 1, role: 'PARTICIPANT' };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockResolvedValue('newMockToken');

            // Call service
            const result = await AuthService.refreshToken(mockToken);

            // Assertions
            expect(jwt.verify).toHaveBeenCalledWith(
                mockToken,
                process.env.REFRESH_TOKEN_SECRET
            );
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockPayload.user_id }
            });
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('should throw an error with an invalid refresh token', async () => {
            // Setup mocks
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Assertions
            await expect(AuthService.refreshToken('invalidToken'))
                .rejects
                .toThrow('Invalid refresh token');
        });
    });
});