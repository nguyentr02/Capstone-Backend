// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding for implemented modules...');
  
  // Clear previous data
  await clearDatabase();
  
  // 1. Create users with different roles
  const adminUser = await createAdminUser();
  console.log('Created admin user:', adminUser.email);
  
  const organizer = await createOrganizer('John', 'Smith');
  console.log('Created organizer:', organizer.email);
  
  // const participants = await createParticipants(3);
  // console.log('Created 3 participant users');
  
  // 2. Create sample events 
  const publishedEvent = await createEvent(organizer.id, 'Tech Conference 2025', 'SOCIAL', 'PUBLISHED');
  console.log('Created published event:', publishedEvent.name);
  
  const draftEvent = await createEvent(organizer.id, 'Coding Workshop', 'SOCIAL', 'DRAFT');
  console.log('Created draft event:', draftEvent.name);
  
  // 3. Create tickets for the published event
  const tickets = await createTicketsForPublishedEvent(publishedEvent.id);
  console.log('Created tickets for published event');
  
  // 4. Create basic questions for the published event
  await createBasicQuestionsForEvent(publishedEvent.id);
  console.log('Created questions for published event');
  
  console.log('Seeding completed successfully!');
}

// Helper functions
async function clearDatabase() {
  // Only delete data for implemented features
  console.log('Clearing existing data...');
  
  // Delete in correct order to maintain referential integrity
  await prisma.eventQuestions.deleteMany();
  await prisma.question.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  return prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
}

async function createOrganizer(firstName: string, lastName: string) {
  const hashedPassword = await bcrypt.hash('Organizer123!', 10);
  
  return prisma.user.create({
    data: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'ORGANIZER'
    }
  });
}

// async function createParticipants(count: number) {
//   const hashedPassword = await bcrypt.hash('Participant123!', 10);
//   const participants = [];
  
//   for (let i = 1; i <= count; i++) {
//     const participant = await prisma.user.create({
//       data: {
//         firstName: `Participant`,
//         lastName: `${i}`,
//         email: `participant${i}@example.com`,
//         password: hashedPassword,
//         role: 'PARTICIPANT'
//       }
//     });
//     participants.push(participant);
//   }
  
//   return participants;
// }

async function createEvent(organizerId: number, name: string, eventType: 'MUSICAL' | 'SPORTS' | 'SOCIAL' | 'VOLUNTEERING', status: 'DRAFT' | 'PUBLISHED') {
  // Create dates for event
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30); // Event starts in 30 days
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1); // 1-day event
  
  return prisma.event.create({
    data: {
      organiserId: organizerId,
      name,
      description: `This is a sample ${eventType.toLowerCase()} event for development testing.`,
      location: 'Sample Venue, Melbourne',
      capacity: 100,
      eventType,
      startDateTime: startDate,
      endDateTime: endDate,
      status,
      isFree: false // Default to paid event
    }
  });
}

async function createTicketsForPublishedEvent(eventId: number) {
  // Sale dates
  const salesStart = new Date();
  const salesEnd = new Date();
  salesEnd.setDate(salesEnd.getDate() + 25); // Sales end 5 days before event
  
  // Create two ticket types
  const standardTicket = await prisma.ticket.create({
    data: {
      eventId,
      name: 'Standard',
      description: 'Standard entry ticket',
      price: 50.00,
      quantityTotal: 70,
      quantitySold: 0,
      salesStart,
      salesEnd,
      status: 'ACTIVE'
    }
  });
  
  const vipTicket = await prisma.ticket.create({
    data: {
      eventId,
      name: 'VIP',
      description: 'Premium entry with additional benefits',
      price: 120.00,
      quantityTotal: 30,
      quantitySold: 0,
      salesStart,
      salesEnd,
      status: 'ACTIVE'
    }
  });
  
  return [standardTicket, vipTicket];
}

async function createBasicQuestionsForEvent(eventId: number) {
  // Create a simple question
  const question = await prisma.question.create({
    data: {
      questionText: 'Do you have any dietary requirements?',
      questionType: 'TEXT'
    }
  });
  
  // Link the question to the event
  await prisma.eventQuestions.create({
    data: {
      eventId,
      questionId: question.id,
      isRequired: false,
      displayOrder: 1
    }
  });
  
  return question;
}

// Execute the seeding function
main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed');
  });