import { prisma } from '../config/prisma'
import { UserUpdateDto } from "../types/userTypes";
import { ValidationError } from "../utils/errors";
import bcrypt from 'bcrypt';

export class UserService {

    // ------- User functionalities --------
    // 01 - Get user profile
    static async getUserProfile(userId:number){

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }
        
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 02 - Update user profile
    static async updateUserProfile(userId:number, data: UserUpdateDto){
        
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: data
        });

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 03 - Update user password
    static async updateUserPassword(userId:number, currentPassword:string, newPassword:string){

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }

        // Verify current password after hashing
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) { throw new ValidationError('Current passeword is incorrect'); }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return {success: true};
    }

    // ------- Admin funcitonalities --------
    // 04 - Get all users
    static async getAllUsers()
    {
        try
        {
            const users = await prisma.user.findMany();
            return users;
        }
        catch(error)
        {
            console.error("Error fetching users", error)
        }
        
    }

    static async getUserById(userId:number){
       try
       {    
            
            const user = await prisma.user.findUnique({
                where:{
                    id: userId,
                },
            });
            !user ? console.log('User not found') : '';  
            
            return user; 
       } 
       catch(error)
       {
            console.error('Error fetching user:', error)
       }
    }
    static async updateUserRole(userId:number){}
    static async deleteUser(userId:number){}
}