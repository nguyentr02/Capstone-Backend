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
            // const response = await request(app).post('/api/auth/register').send(testUser);

            // Mock hasded password
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

            // Mock token
            const mockToken = "mockToken123";
            (jwt.sign as jest.Mock).mockResolvedValue(mockToken);

            // Call the service method
            const result = await AuthService.registerUser(registerData);

            //Verify the results
            expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10); // Check if password was hashed
            expect(prisma.user.create).toHaveBeenCalledWith({ // Check if user was created
                data: {
                    ...registerData,
                    password: hashedPassword,
                    role: 'PARTICIPANT'
                }
            }); 

            // Check the returned data
            expect(result.user).toEqual(expect.objectContaining({
                email: registerData.email,
                firstname: registerData.firstName,
                lastname: registerData.lastName
            }));
            
            // expect(result.token).toBe(mockToken);
        })

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
});