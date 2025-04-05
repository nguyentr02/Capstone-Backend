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

    // Test cases for getAllEvents method
    describe('getAllEvents', () => {
      it('should return events and pagination', async () => {
        // Mock data
        const mockEvents = [{ id: 1, name: 'Test Event' }];
        const mockCount = 1;
        
        (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
        (prisma.event.count as jest.Mock).mockResolvedValue(mockCount);
        
        // Call service
        const result = await EventService.getAllEvents({ page: 1, limit: 10 });
        
        // Assertions
        expect(result.events).toEqual(mockEvents);
        expect(result.pagination).toEqual({
            total: mockCount,
            page: 1,
            limit: 10,
            pages: 1
        });
      });

      it('should apply filters correctly', async () => {
        // Mock response
        (prisma.event.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.event.count as jest.Mock).mockResolvedValue(0);
        
        // Call with filters
        await EventService.getAllEvents({
            page: 1,
            limit: 10,
            filters: {
                search: 'concert',
                eventType: 'MUSICAL',
                isFree: false
            }
        });
        
        // Check filters were applied
        expect(prisma.event.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.any(Array),
                    eventType: 'MUSICAL',
                    isFree: false
                })
            })
        );
      });


    });

    // Test cases for updateEvent method
    describe('updateEvent', () => {
      it('should update event basic details', async () => {
          // Mock data
          const existingEvent = { 
              id: 1, 
              name: 'Old Name', 
              isFree: false,
              status: 'DRAFT'
          };
          const updateData = { name: 'New Name' };
          
          (prisma.event.findUnique as jest.Mock).mockResolvedValue(existingEvent);
          (prisma.event.update as jest.Mock).mockResolvedValue({ ...existingEvent, ...updateData });
          
          // Call service
          await EventService.updateEvent(1, updateData);
          
          // Assertions
          expect(prisma.event.update).toHaveBeenCalledWith({
              where: { id: 1 },
              data: expect.objectContaining({
                  name: 'New Name'
              })
          });
      });
      
      it('should reject updates to completed events', async () => {
          // Mock completed event
          (prisma.event.findUnique as jest.Mock).mockResolvedValue({
              id: 1,
              status: 'COMPLETED'
          });
          
          // Expect error
          await expect(EventService.updateEvent(1, { name: 'New Name' }))
              .rejects
              .toThrow('Cannot update a completed event');
      });
      
      it('should handle changing from free to paid correctly', async () => {
          // Mock data
          const existingEvent = { 
              id: 1, 
              name: 'Event', 
              isFree: true,
              status: 'DRAFT'
          };
          const updateData = { 
              isFree: false,
              tickets: [{
                  name: "General Admission",
                  price: 50,
                  quantityTotal: 100,
                  salesStart: new Date(),
                  salesEnd: tomorrow
              }]
          };
          
          (prisma.event.findUnique as jest.Mock).mockResolvedValue(existingEvent);
          (prisma.event.update as jest.Mock).mockResolvedValue({ ...existingEvent, isFree: false });
          (prisma.registration.count as jest.Mock).mockResolvedValue(0);
          
          // Call service
          await EventService.updateEvent(1, updateData);
          
          // Assertions
          expect(prisma.event.update).toHaveBeenCalledWith({
              where: { id: 1 },
              data: expect.objectContaining({
                  isFree: false
              })
          });
          expect(prisma.ticket.create).toHaveBeenCalled();
      });
    });

    // Test cases for updateEventStatus method
    describe('updateEventStatus', () => {

      it('should publish an event with valid data', async () => {
          // Mock data
          const draftEvent = { id: 1, status: 'DRAFT', isFree: true };
          
          (prisma.event.findUnique as jest.Mock).mockResolvedValue(draftEvent);
          (prisma.eventQuestions.count as jest.Mock).mockResolvedValue(1);
          (prisma.event.update as jest.Mock).mockResolvedValue({ ...draftEvent, status: 'PUBLISHED' });
          
          // Call service
          const result = await EventService.updateEventStatus(1, 'PUBLISHED');
          
          // Assertions
          expect(result.status).toBe('PUBLISHED');
          expect(prisma.event.update).toHaveBeenCalledWith({
              where: { id: 1 },
              data: { status: 'PUBLISHED' }
          });
      });
      
      it('should cancel an event and update registrations', async () => {
          // Mock data
          const publishedEvent = { id: 1, status: 'PUBLISHED', isFree: true };
          
          (prisma.event.findUnique as jest.Mock).mockResolvedValue(publishedEvent);
          (prisma.registration.count as jest.Mock).mockResolvedValue(5);
          (prisma.event.update as jest.Mock).mockResolvedValue({ ...publishedEvent, status: 'CANCELLED' });
          
          // Call service
          const result = await EventService.updateEventStatus(1, 'CANCELLED');
          
          // Assertions
          expect(result.status).toBe('CANCELLED');
          expect(prisma.registration.updateMany).toHaveBeenCalledWith({
              where: expect.any(Object),
              data: { status: 'CANCELLED' }
          });
      });
      
      it('should reject publishing an event without questions', async () => {
          // Mock data
          (prisma.event.findUnique as jest.Mock).mockResolvedValue({
              id: 1, 
              status: 'DRAFT',
              isFree: true
          });
          (prisma.eventQuestions.count as jest.Mock).mockResolvedValue(0);
          
          // Expect error
          await expect(EventService.updateEventStatus(1, 'PUBLISHED'))
              .rejects
              .toThrow('Events must have at least one question before publishing');
      });

      it('should not allow converting a paid event to free', async () => {
            // Mock data
            (prisma.event.findUnique as jest.Mock).mockResolvedValue({
                id: 1, 
                status: 'DRAFT',
                isFree: false
            });
            
            // Expect error
            await expect(EventService.updateEventStatus(1, 'PUBLISHED'))
                .rejects
                .toThrow('Paid events cannot be converted to free events');
      });

      it ('should not allow converting a free event to paid without tickets', async () => {
            // Mock data
            (prisma.event.findUnique as jest.Mock).mockResolvedValue({
                id: 1, 
                status: 'DRAFT',
                isFree: true
            });
            (prisma.eventQuestions.count as jest.Mock).mockResolvedValue(1);
            (prisma.ticket.count as jest.Mock).mockResolvedValue(0);
            
            // Expect error
            await expect(EventService.updateEventStatus(1, 'PUBLISHED'))
                .rejects
                .toThrow('Paid events must have at least one ticket type');
        });
    });

    describe('getEventById', () => {});
    
    // Test cases for deleteEvent method
    describe('deleteEvent', () => {
      it('should delete an event without registrations', async () => {
          // Mock data
          (prisma.event.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
          (prisma.registration.count as jest.Mock).mockResolvedValue(0);
          
          // Call service
          await EventService.deleteEvent(1);
          
          // Assertions
          expect(prisma.eventQuestions.deleteMany).toHaveBeenCalled();
          expect(prisma.ticket.deleteMany).toHaveBeenCalled();
          expect(prisma.event.delete).toHaveBeenCalledWith({
              where: { id: 1 }
          });
      });
      
      it('should reject deleting an event with registrations', async () => {
          // Mock data
          (prisma.event.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
          (prisma.registration.count as jest.Mock).mockResolvedValue(5);
          
          // Expect error
          await expect(EventService.deleteEvent(1))
              .rejects
              .toThrow('Cannot delete an event with registrations');
      });
  });
})
