import { Request, Response } from 'express';
import { AuthService } from '../services/authServices';
import { RegisterDto, LoginDto } from '../types/authTypes';
import { AppError } from '../utils/errors';

export class AuthController {

    private static REFRESH_TOKEN_COOKIE_OPTIONS = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'

    }
    
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

           // Set refresh token as HTTP-only cookie
           res.cookie(
            'refreshToken',
            authData.refreshToken,
            this.REFRESH_TOKEN_COOKIE_OPTIONS
           )

            res.status(200).json({
                success: true,
                data: {
                    user: authData.user,
                    accessToken: authData.accessToken
                }
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