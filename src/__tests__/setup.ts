import { prisma } from '../config/prisma';

//Connect to test db before all tests
beforeAll(async () => {
    await prisma.$connect();
});

// Clear test data after all tests
afterAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    await prisma.$disconnect();
});