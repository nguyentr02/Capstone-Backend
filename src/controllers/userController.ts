import {Request, Response} from 'express';
import {UserService} from '../services/userService';

export class UserController {

    // 01 - Get user profile
    static async getProfile(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.user.id;
            const user = await UserService.getProfile(userId);

            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Get profile error:', error);

            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }
}