import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ParticipantDto } from '../types/participantTypes';
import { prisma } from '../config/prisma'; // Import main prisma client for non-transactional use if needed later

// Define the type for the Prisma transaction client
type PrismaTransactionClient = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export class ParticipantService {

    /**
     * Finds an existing participant by email or creates a new one.
     * Designed to be used within a Prisma transaction.
     * @param participantData - The data for the participant to find or create.
     * @param tx - The Prisma transaction client.
     * @returns The found or newly created participant.
     */
    static async findOrCreateParticipant(participantData: ParticipantDto, tx: PrismaTransactionClient) {
        let participant = await tx.participant.findUnique({
            where: { email: participantData.email }
        });

        if (!participant) {
            participant = await tx.participant.create({
                data: {
                    ...participantData,
                    // Ensure dateOfBirth is handled correctly (string vs Date)
                    dateOfBirth: participantData.dateOfBirth ? new Date(participantData.dateOfBirth) : null,
                }
            });
        } else {
            // Optional: Implement logic to update existing participant details if needed.
            // For now, we just return the found participant.
            // Example update (use with caution, consider data merging strategy):
            // participant = await tx.participant.update({
            //     where: { id: participant.id },
            //     data: {
            //         ...participantData,
            //         email: undefined, // Don't update email if found by it
            //         dateOfBirth: participantData.dateOfBirth ? new Date(participantData.dateOfBirth) : null,
            //     }
            // });
        }
        return participant;
    }

    // TODO: Add other participant-related service methods here later
    // e.g., getParticipantById, updateParticipant, etc.
}
