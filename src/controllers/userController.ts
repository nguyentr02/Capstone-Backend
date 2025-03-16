import {Request, Response} from 'express';
import {UserService} from '../services/userServices';

export class UserController {

    // 01 - Get user profile
    static async getUserProfile(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.user?.user_id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }

            const user = await UserService.getUserProfile(userId);

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

    // 02 - Update user profile
    static async updateUserProfile(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.user?.user_id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }

            const data = req.body;
            const user = await UserService.updateUserProfile(userId, data);

            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Update profile error:', error);

            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }

    //03 - Update user password
    static async updateUserPassword(req: Request, res: Response) : Promise<void> {
        try {

            const userId = req.user?.user_id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }

            const {currentPassword, newPassword} = req.body;
            const result = await UserService.updateUserPassword(userId, currentPassword, newPassword);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Update password error:', error);

            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }

    //05 - Get all users
    static async getAllUsers(req: Request, res: Response): Promise<void>{
        try
        {
            const user = await UserService.getAllUsers();

            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch(error)
        {
                res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }

    //06 - Get user by id
    static async getUserById(req: Request, res: Response):Promise<void>{
        try {

            const userId = Number(req.params.id);
            const user = await UserService.getUserById(userId);

            res.status(200).json({
                success: true,
                data: user
            });

        }
        catch(err) {

            res.status(404).json({
                success: false,
                message: 'Event not found',
                error: err
            })
            
        }
    }
}