import { Request, Response } from 'express';
import { AuthService } from '../services/authServices';
import { RegisterDto, LoginDto } from '../types/authTypes';
import { AppError } from '../utils/errors';

export class AuthController {
    
    static async registerUser(req: Request<{}, {}, RegisterDto>, res: Response) {
        try {
            const authData = await AuthService.registerUser(req.body);
            res.status(201).json({
                success: true,
                data: authData
            });
        }
        catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }

    static async loginUser(req: Request<{}, {}, LoginDto>, res: Response) {
        try {
           const authData = await AuthService.loginUser(req.body);

            res.status(200).json({
                success: true,
                data: authData
            });
        }
        catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }
}