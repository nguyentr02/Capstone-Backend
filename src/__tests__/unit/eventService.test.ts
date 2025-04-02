import { EventService} from "../../services/eventServices";
import { prisma } from "../../config/prisma";
import { CreateEventDTO } from "../../types/eventTypes";

// Mocking the prisma client
jest.mock("../../config/prisma", () => ({
  prisma: {
    event: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
    },
    ticket : {
        create: jest.fn(),
    },
    question: {
        create: jest.fn()
    },
    eventQuestions: {
        create: jest.fn()
    },
    $transaction: jest.fn((callback) => callback(prisma))
  }
}));

describe('EventService', () => { 

    beforeEach(() => {
        jest.clearAllMocks();
    })

    // Sample test data
  const validEventData: CreateEventDTO = {
    name: "Test Event",
    description: "This is a test event",
    location: "Test Location",
    capacity: 100,
    isFree: false,
    eventType: "SOCIAL",
    startDateTime: new Date(Date.now() + 86400000), // Tomorrow
    endDateTime: new Date(Date.now() + 172800000), // Day after tomorrow
    tickets: [
      {
        name: "General Admission",
        description: "Standard ticket",
        price: 50,
        quantityTotal: 80,
        salesStart: new Date(),
        salesEnd: new Date(Date.now() + 86400000) // Tomorrow
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

    describe('createEvent', () => {});
    describe('getEvents', () => {});
    describe('getEvent', () => {});
    
});
