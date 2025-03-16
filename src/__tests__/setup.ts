import { prisma } from '../config/prisma';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

//Connect to test db before all tests
beforeAll(async () => {
    await prisma.$connect();
    console.log('Connected to test database');
});

// Clear test data after all tests
afterAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.response.deleteMany();
    await prisma.eventQuestions.deleteMany();
    await prisma.question.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();

    await prisma.$disconnect();
    console.log('Disconnected from test database');
});