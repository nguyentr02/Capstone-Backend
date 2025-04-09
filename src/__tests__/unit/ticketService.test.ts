import { TicketService } from '../../services/ticketServices';
import { prisma } from '../../config/prisma';
import { ValidationError } from '../../utils/errors';

// Mock the Prisma client
jest.mock('../../config/prisma', () => ({
    prisma: {
        event: {
            findUnique: jest.fn()
        },
        ticket: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn()
        }
    }
}));

describe('TicketService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test suite for createTicket method
    describe('createTicket', () => {
        const validEventId = 1;
        const validTicketData = {
            eventId: validEventId,
            name: 'Test Ticket',
            description: 'Test description',
            price: 25.00,
            quantityTotal: 100,
            salesStart: new Date('2025-01-01T00:00:00Z'),
            salesEnd: new Date('2025-04-01T00:00:00Z')
        };

        const mockEvent = {
            id: validEventId,
            name: 'Test Event',
            startDateTime: new Date('2025-05-01T00:00:00Z'),
            endDateTime: new Date('2025-05-02T00:00:00Z'),
            isFree: false
        };

        const mockTicket = {
            id: 1,
            ...validTicketData,
            status: 'ACTIVE',
            quantitySold: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should successfully create a ticket for a valid event', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.createTicket(validEventId, validTicketData);

            // Assert
            expect(prisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: validEventId }
            });

            expect(prisma.ticket.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    eventId: validEventId,
                    name: validTicketData.name,
                    price: validTicketData.price,
                    quantityTotal: validTicketData.quantityTotal
                })
            });

            expect(result).toEqual(mockTicket);
        });

        it('should throw error when event is not found', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(TicketService.createTicket(validEventId, validTicketData))
                .rejects
                .toThrow('Event not found');
        });

        it('should throw error when sales end date is before sales start date', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const invalidTicketData = {
                ...validTicketData,
                salesStart: new Date('2025-04-01T00:00:00Z'),
                salesEnd: new Date('2025-01-01T00:00:00Z') // Before start date
            };

            // Act & Assert
            await expect(TicketService.createTicket(validEventId, invalidTicketData))
                .rejects
                .toThrow('Sales end date must be after sales start date');
        });

        it('should throw error when sales end date is after event end date', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const invalidTicketData = {
                ...validTicketData,
                salesEnd: new Date('2025-06-01T00:00:00Z') // After event end
            };

            // Act & Assert
            await expect(TicketService.createTicket(validEventId, invalidTicketData))
                .rejects
                .toThrow('Ticket sales cannot end after the event ends');
        });

        it('should throw error when ticket price is negative', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const invalidTicketData = {
                ...validTicketData,
                price: -10 // Negative price
            };

            // Act & Assert
            await expect(TicketService.createTicket(validEventId, invalidTicketData))
                .rejects
                .toThrow('Ticket price cannot be negative');
        });

        it('should throw error when ticket quantity is not positive', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const invalidTicketData = {
                ...validTicketData,
                quantityTotal: 0 // Zero quantity
            };

            // Act & Assert
            await expect(TicketService.createTicket(validEventId, invalidTicketData))
                .rejects
                .toThrow('Ticket quantity must be positive');
        });
    });

    // Test suite for updateTicket method
    describe('updateTicket', () => {
        const ticketId = 1;
        const eventId = 1;

        const mockTicket = {
            id: ticketId,
            eventId: eventId,
            name: 'Original Ticket',
            description: 'Original description',
            price: 25.00,
            quantityTotal: 100,
            quantitySold: 10,
            salesStart: new Date('2025-01-01T00:00:00Z'),
            salesEnd: new Date('2025-04-01T00:00:00Z'),
            status: 'ACTIVE',
            event: {
                id: eventId,
                name: 'Test Event',
                endDateTime: new Date('2025-05-02T00:00:00Z')
            }
        };

        it('should successfully update a ticket', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            const updatedTicket = {
                ...mockTicket,
                name: 'Updated Ticket',
                price: 30.00
            };

            (prisma.ticket.update as jest.Mock).mockResolvedValue(updatedTicket);

            // Act
            const result = await TicketService.updateTicket(ticketId, {
                name: 'Updated Ticket',
                price: 30.00
            });

            // Assert
            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
                include: { event: true }
            });

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: ticketId },
                data: expect.objectContaining({
                    name: 'Updated Ticket',
                    price: 30.00
                })
            });

            expect(result).toEqual(updatedTicket);
        });

        it('should throw error when ticket is not found', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(TicketService.updateTicket(ticketId, { name: 'Updated Ticket' }))
                .rejects
                .toThrow('Ticket not found');
        });

        it('should throw error when reducing quantity below sold amount', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act & Assert
            await expect(TicketService.updateTicket(ticketId, { quantityTotal: 5 })) // Less than 10 sold
                .rejects
                .toThrow('Cannot reduce quantity below the number of tickets already sold');
        });

        it('should throw error when updating with invalid sales dates', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act & Assert
            await expect(TicketService.updateTicket(ticketId, {
                salesStart: new Date('2025-05-01T00:00:00Z'),
                salesEnd: new Date('2025-04-01T00:00:00Z') // Before start
            }))
                .rejects
                .toThrow('Sales end date must be after sales start date');
        });

        it('should throw error when sales end date is after event end', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act & Assert
            await expect(TicketService.updateTicket(ticketId, {
                salesEnd: new Date('2025-06-01T00:00:00Z') // After event end
            }))
                .rejects
                .toThrow('Ticket sales cannot end after the event ends');
        });
    });

    // Test suite for deleteTicket method
    describe('deleteTicket', () => {
        const ticketId = 1;

        it('should successfully delete a ticket with no sales', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                quantitySold: 0
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);
            (prisma.ticket.delete as jest.Mock).mockResolvedValue(undefined);

            // Act
            await TicketService.deleteTicket(ticketId);

            // Assert
            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId }
            });

            expect(prisma.ticket.delete).toHaveBeenCalledWith({
                where: { id: ticketId }
            });
        });

        it('should throw error when ticket is not found', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(TicketService.deleteTicket(ticketId))
                .rejects
                .toThrow('Ticket not found');
        });

        it('should throw error when ticket has been purchased', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                quantitySold: 5 // Some tickets sold
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act & Assert
            await expect(TicketService.deleteTicket(ticketId))
                .rejects
                .toThrow('Cannot delete a ticket that has been purchased');
        });
    });

    // Test suite for getTicketsByEvent method
    describe('getTicketsByEvent', () => {
        const eventId = 1;

        it('should return tickets for an event', async () => {
            // Arrange
            const mockEvent = { id: eventId };
            const mockTickets = [
                { id: 1, name: 'General Admission', price: 20.00 },
                { id: 2, name: 'VIP', price: 50.00 }
            ];

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);

            // Act
            const result = await TicketService.getTicketsByEvent(eventId);

            // Assert
            expect(prisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: eventId }
            });

            expect(prisma.ticket.findMany).toHaveBeenCalledWith({
                where: {
                    eventId,
                    status: 'ACTIVE'
                },
                orderBy: { price: 'asc' }
            });

            expect(result).toEqual(mockTickets);
        });

        it('should throw error when event is not found', async () => {
            // Arrange
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(TicketService.getTicketsByEvent(eventId))
                .rejects
                .toThrow('Event not found');
        });
    });

    // Test suite for checkAvailability method
    describe('checkAvailability', () => {
        const ticketId = 1;
        const now = new Date();

        const futureSalesStart = new Date(now);
        futureSalesStart.setDate(now.getDate() + 10);

        const pastSalesEnd = new Date(now);
        pastSalesEnd.setDate(now.getDate() - 1);

        it('should return available=true for available tickets', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                status: 'ACTIVE',
                quantityTotal: 100,
                quantitySold: 50,
                salesStart: new Date(now.setDate(now.getDate() - 10)), // 10 days ago
                salesEnd: new Date(now.setDate(now.getDate() + 20)), // 20 days from now
                event: {
                    status: 'PUBLISHED'
                }
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.checkAvailability(ticketId);

            // Assert
            expect(result.available).toBe(true);
            expect(result.availableQuantity).toBe(50);
        });

        it('should return available=false for inactive tickets', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                status: 'INACTIVE',
                quantityTotal: 100,
                quantitySold: 0,
                salesStart: new Date(now.setDate(now.getDate() - 10)),
                salesEnd: new Date(now.setDate(now.getDate() + 20)),
                event: {
                    status: 'PUBLISHED'
                }
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.checkAvailability(ticketId);

            // Assert
            expect(result.available).toBe(false);
            expect(result.reason).toContain('no longer available');
        });

        it('should return available=false for unpublished events', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                status: 'ACTIVE',
                quantityTotal: 100,
                quantitySold: 0,
                salesStart: new Date(now.setDate(now.getDate() - 10)),
                salesEnd: new Date(now.setDate(now.getDate() + 20)),
                event: {
                    status: 'DRAFT'
                }
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.checkAvailability(ticketId);

            // Assert
            expect(result.available).toBe(false);
            expect(result.reason).toContain('not open for registration');
        });

        it('should return available=false when sales have not started', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                status: 'ACTIVE',
                quantityTotal: 100,
                quantitySold: 0,
                salesStart: futureSalesStart, // Future date
                salesEnd: new Date(now.setDate(now.getDate() + 20)),
                event: {
                    status: 'PUBLISHED'
                }
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.checkAvailability(ticketId);

            // Assert
            expect(result.available).toBe(false);
            expect(result.reason).toContain('not started yet');
        });

        it('should return available=false when sales have ended', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                status: 'ACTIVE',
                quantityTotal: 100,
                quantitySold: 50,
                salesStart: new Date('2025-01-01T00:00:00Z'),
                salesEnd: pastSalesEnd, // Past date
                event: {
                    status: 'PUBLISHED'
                }
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.checkAvailability(ticketId);

            // Assert
            expect(result.available).toBe(false);
            expect(result.reason).toContain('have ended');
        });

        it('should return available=false when sold out', async () => {
            // Arrange
            const mockTicket = {
                id: ticketId,
                status: 'ACTIVE',
                quantityTotal: 100,
                quantitySold: 100, // Sold out
                salesStart: new Date('2025-01-01T00:00:00Z'),
                salesEnd: new Date('2025-04-10T00:00:00Z'),
                event: {
                    status: 'PUBLISHED'
                }
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

            // Act
            const result = await TicketService.checkAvailability(ticketId);

            // Assert
            expect(result.available).toBe(false);
            expect(result.availableQuantity).toBe(0);
            expect(result.reason).toContain('Sold out');
        });

        it('should throw error when ticket is not found', async () => {
            // Arrange
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(TicketService.checkAvailability(ticketId))
                .rejects
                .toThrow('Ticket not found');
        });
    });
});