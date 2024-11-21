import {prisma} from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Role, User} from '@prisma/client'

export class UserService {
    // Create a new user
    static async createUser (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNo?: string;
        role?: Role;
    }) {
        const hasedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data : { ...data, password: hasedPassword }
        })

        // Return the user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Login a user
    static async login(email: string, password: string){
        const user = await prisma.user.findUnique({where: {email}})

        if (!user) {
            throw new Error('Invalid credentials')
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        return {token}
    }
    
    // Find a user by ID
    static async getUserById(id: number) {
        const user = await prisma.user.findUnique({
            where:{id},
            include: {
                events: true,
                tickets: {
                    include: {
                        event: true,
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}