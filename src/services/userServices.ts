import { Prisma } from "@prisma/client";

export class UserService {

    // ------- User functionalities --------
    static async getProfile(userId:number){}
    static async updateProfile(userId:number){}
    static async changePassword(userId:number){}

    // ------- Admin funcitonalities --------
    static async getAllUsers(){}
    static async getUserById(userId:number){}
    static async updateUserRole(userId:number){}
    static async deleteUser(userId:number){}
}