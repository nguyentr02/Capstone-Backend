import { AuthService } from "../../services/authServices";
import { prisma } from "../../config/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock external dependencies
// WHY??: 
// --We don't want to actually connect to a database during unit tests
// --We want to control the behavior of these external dependencies
//--We want our tests to run quickly and reliably
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
        const registerData = {
            email: "test@example.com", 
            password: "password123",
            firstName: "John",
            lastName: "Doe",
            phoneNo: "0123456789"
        }

        // Test 1: Registering a new user
        it('should successfully register a new user', async () => {
            // Set up mocks to simulate a successful registration

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
            expect(result.token).toBe(mockToken);

        })

        //Test 2: Error handling for existing user
        it('should throw an error if the email already exists', async () => {
            // Mock findUnique
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({id : 1});

            
        });
    });
});
