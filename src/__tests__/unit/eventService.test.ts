import { EventService} from "../../services/eventServices";
import { prisma } from "../../config/prisma";
import { CreateEventDTO } from "../../types/eventTypes";

// Mock Prisma client
jest.mock('../../config/prisma', () => ({
  prisma: {
      event: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn()
      },
      ticket: {
          create: jest.fn(),
          deleteMany: jest.fn(),
          count: jest.fn()
      },
      eventQuestions: {
          create: jest.fn(),
          findMany: jest.fn(),
          deleteMany: jest.fn(),
          count: jest.fn()
      },
      question: {
          create: jest.fn()
      },
      registration: {
          count: jest.fn(),
          updateMany: jest.fn()
      },
      $transaction: jest.fn(callback => callback(prisma))
  }
}));

describe('EventService', () => { 

    beforeEach(() => {
        jest.clearAllMocks();
    })

    // Sample test data
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const validPaidEventData: CreateEventDTO = {
        name: "Test Paid Event",
        description: "This is a test paid event",
        location: "Test Location",
        capacity: 100,
        eventType: "SOCIAL",
        isFree: false,
        startDateTime: tomorrow,
        endDateTime: dayAfterTomorrow,
        tickets: [
            {
                name: "General Admission",
                description: "Standard ticket",
                price: 50,
                quantityTotal: 80,
                salesStart: new Date(),
                salesEnd: tomorrow
            }
        ],
        questions: [
            {
                questionText: "What is your t-shirt size?",
                isRequired: true,
                displayOrder: 1
            }
        ]
    };
    
    const validFreeEventData: CreateEventDTO = {
        name: "Test Free Event",
        description: "This is a test free event",
        location: "Test Location",
        capacity: 100,
        eventType: "SOCIAL",
        isFree: true,
        startDateTime: tomorrow,
        endDateTime: dayAfterTomorrow,
        questions: [
            {
                questionText: "What is your t-shirt size?",
                isRequired: true,
                displayOrder: 1
            }
        ]
    };

    // Test cases for createEvent method
    describe('createEvent', () => {
      it('should create a paid event successfully with tickets', async () => {
        const mockEvent = {id: 1, ...validFreeEventData};
        const mockTicket = {id: 1, eventId: 1, ...validPaidEventData.tickets![0]};
        const mockQuestion = {id: 1, questionText: 'What is your t-shirt sizee?'};
        const mockEventQuestion = { id: 1, eventId: 1, questionId: 1 };

        // Mock the Prisma client methods
        (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);
        (prisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);
        (prisma.question.create as jest.Mock).mockResolvedValue(mockQuestion);
        (prisma.eventQuestions.create as jest.Mock).mockResolvedValue(mockEventQuestion);

        // Call the service
        const result = await EventService.createEvent(1, validPaidEventData);

        // Assertions
        expect(result).toBeDefined();
        expect(prisma.event.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: validPaidEventData.name,
                isFree: false
            })
        });
        expect(prisma.ticket.create).toHaveBeenCalled();
        expect(prisma.question.create).toHaveBeenCalled();
        expect(prisma.eventQuestions.create).toHaveBeenCalled();
      });

      it('should reject a paid event without tickets', async () => {
        // Create invalid data without tickets
        const invalidData = { 
            ...validPaidEventData,
            tickets: [] 
        };
        
        // Expect error
        await expect(EventService.createEvent(1, invalidData))
            .rejects
            .toThrow('At least one ticket type is required for paid events');
      });

      it('should reject a paid event without tickets', async () => {
        // Create invalid data without tickets
        const invalidData = { 
            ...validPaidEventData,
            tickets: [] 
        };
        
        // Expect error
        await expect(EventService.createEvent(1, invalidData))
            .rejects
            .toThrow('At least one ticket type is required for paid events');
      });
    });

    describe('getAllEvents', () => {});
    describe('getEvent', () => {});
    
})
