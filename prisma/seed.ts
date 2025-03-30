// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  await clearDatabase();
  
  // 1. Create users with different roles
  const adminUser = await createAdminUser();
  const organizer1 = await createOrganizer('John', 'Smith');
  const organizer2 = await createOrganizer('Jane', 'Doe');
  const participants = await createParticipants(5);
  
  // 2. Create sample events
  const musicEvent = await createEvent(organizer1.id, 'Annual Music Festival', 'MUSICAL');
  const sportEvent = await createEvent(organizer2.id, 'Marathon 2025', 'SPORTS');
  const socialEvent = await createEvent(organizer1.id, 'Networking Mixer', 'SOCIAL');
  
  // 3. Create tickets for each event
  await createTicketsForEvent(musicEvent.id);
  await createTicketsForEvent(sportEvent.id);
  await createTicketsForEvent(socialEvent.id);
  
  // 4. Create questions for events
  await createQuestionsForEvent(musicEvent.id);
  await createQuestionsForEvent(sportEvent.id, true);
  
  // 5. Create some registrations and responses
  await createRegistrationsAndResponses(participants, musicEvent.id);
  
  console.log('Seeding completed successfully!');
}

// Helper functions
async function clearDatabase() {
  // Delete in correct order to maintain referential integrity
  await prisma.payment.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.response.deleteMany();
  await prisma.eventQuestions.deleteMany();
  await prisma.question.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

// Create users with different roles
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

async function createParticipants(count: number) {
  const hashedPassword = await bcrypt.hash('Participant123!', 10);
  const participants: Array<{ 
    id: number; 
    firstName: string; 
    lastName: string; 
    email: string; 
    phoneNo: string | null; 
    role: string; 
    password: string; 
    createdAt: Date; 
    updatedAt: Date }> = [];
  
  for (let i = 1; i <= count; i++) {
    const participant = await prisma.user.create({
      data: {
        firstName: `Participant`,
        lastName: `${i}`,
        email: `participant${i}@example.com`,
        password: hashedPassword,
        role: 'PARTICIPANT'
      }
    });
    participants.push(participant);
  }
  
  return participants;
}

async function createEvent(organizerId: number, name: string, eventType: 'MUSICAL' | 'SPORTS' | 'SOCIAL' | 'VOLUNTEERING') {
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
      status: 'PUBLISHED'
    }
  });
}

async function createTicketsForEvent(eventId: number) {
  // Sale dates
  const salesStart = new Date();
  const salesEnd = new Date();
  salesEnd.setDate(salesEnd.getDate() + 25); // Sales end 5 days before event
  
  // General admission ticket
  await prisma.ticket.create({
    data: {
      eventId,
      name: 'General Admission',
      description: 'Standard entry ticket',
      price: 50.00,
      quantityTotal: 70,
      quantitySold: 0,
      salesStart,
      salesEnd,
      status: 'ACTIVE'
    }
  });
  
  // VIP ticket
  await prisma.ticket.create({
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
}

async function createQuestionsForEvent(eventId: number, includeExtras = false) {
  // Create common questions
  const q1 = await prisma.question.create({
    data: {
      questionText: 'What is your t-shirt size?',
      questionType: 'MULTIPLE_CHOICE'
    }
  });
  
  const q2 = await prisma.question.create({
    data: {
      questionText: 'Do you have any dietary restrictions?',
      questionType: 'TEXT'
    }
  });
  
  // Link questions to event
  await prisma.eventQuestions.create({
    data: {
      eventId,
      questionId: q1.id,
      isRequired: true,
      displayOrder: 1
    }
  });
  
  await prisma.eventQuestions.create({
    data: {
      eventId,
      questionId: q2.id,
      isRequired: false,
      displayOrder: 2
    }
  });
  
  // Add extra questions for some events
  if (includeExtras) {
    const q3 = await prisma.question.create({
      data: {
        questionText: 'How did you hear about this event?',
        questionType: 'TEXT'
      }
    });
    
    await prisma.eventQuestions.create({
      data: {
        eventId,
        questionId: q3.id,
        isRequired: false,
        displayOrder: 3
      }
    });
  }
}

async function createRegistrationsAndResponses(participants: any[], eventId: number) {
  // Get tickets for the event
  const tickets = await prisma.ticket.findMany({
    where: { eventId }
  });
  
  if (!tickets.length) return;
  
  // Get event questions
  const eventQuestions = await prisma.eventQuestions.findMany({
    where: { eventId },
    include: { question: true }
  });
  
  // Create registrations for first 3 participants
  for (let i = 0; i < Math.min(3, participants.length); i++) {
    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: participants[i].id,
        eventId,
        status: 'CONFIRMED'
      }
    });
    
    // Create ticket purchase
    const selectedTicket = tickets[i % tickets.length];
    const purchase = await prisma.purchase.create({
      data: {
        registrationId: registration.id,
        ticketId: selectedTicket.id,
        quantity: 1,
        unitPrice: selectedTicket.price,
        totalPrice: selectedTicket.price
      }
    });
    
    // Create payment
    await prisma.payment.create({
      data: {
        purchaseId: purchase.id,
        amount: selectedTicket.price,
        paymentMethod: 'CREDIT_CARD',
        status: 'COMPLETED'
      }
    });
    
    // Create responses to questions
    for (const eq of eventQuestions) {
      let responseText = '';
      
      if (eq.question.questionType === 'MULTIPLE_CHOICE' && 
          eq.question.questionText.includes('t-shirt')) {
        const sizes = ['S', 'M', 'L', 'XL'];
        responseText = sizes[Math.floor(Math.random() * sizes.length)];
      } else if (eq.question.questionText.includes('dietary')) {
        const options = ['None', 'Vegetarian', 'Vegan', 'Gluten-free'];
        responseText = options[Math.floor(Math.random() * options.length)];
      } else {
        responseText = 'Sample response';
      }
      
      await prisma.response.create({
        data: {
          registrationId: registration.id,
          eqId: eq.id,
          responseText
        }
      });
    }
    
    // Update ticket sold count
    await prisma.ticket.update({
      where: { id: selectedTicket.id },
      data: { quantitySold: { increment: 1 } }
    });
  }
}

// Execute the seeding function
main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });