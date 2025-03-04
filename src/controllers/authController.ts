import { Request, Response } from 'express';
import { AuthService } from '../services/authServices';
import { RegisterDto, LoginDto } from '../types/authTypes';
import { AppError, AuthenticationError } from '../utils/errors';

export class AuthController {
   
    private static readonly REFRESH_TOKEN_COOKIE_OPTIONS = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'  // Cookie is available for all paths
    }; 

    //01 - Register a new user
    static async registerUser(req: Request<{}, {}, RegisterDto>, res: Response) {
        try {
            const authData = await AuthService.registerUser(req.body);

            // Set refresh token as an HTTP-only cookie
            res.cookie('refreshToken', authData.refreshToken, AuthController.REFRESH_TOKEN_COOKIE_OPTIONS);

            res.status(201).json({
                success: true,
                data: {
                    user: authData.user,
                    accessToken: authData.accessToken
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
        
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                // During development, include the full error for debugging
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }

    //02 - Login
    static async loginUser(req: Request<{}, {}, LoginDto>, res: Response) {
        try {
           const authData = await AuthService.loginUser(req.body);

            // Set refresh token as an HTTP-only cookie
            res.cookie('refreshToken', authData.refreshToken, AuthController.REFRESH_TOKEN_COOKIE_OPTIONS);

            res.status(200).json({
                success: true,
                data: {
                    user: authData.user,
                    accessToken: authData.accessToken
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
        
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            // During development, include the full error for debugging
            error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
        });
        }
    }

    // 03 - Refresh token
    static async refreshToken(req: Request, res: Response) {
        try {
            const {refreshToken} = req.cookies.refreshToken;
            if (!refreshToken) {
                throw new AuthenticationError('No refresh token provided');
            }

            const tokens = await AuthService.refreshToken(refreshToken);

            // Set new refresh token as an HTTP-only cookie
            res.cookie('refreshToken', tokens.refreshToken, AuthController.REFRESH_TOKEN_COOKIE_OPTIONS);

            res.status(200).json({
                success: true,
                data: {
                    accessToken: tokens.accessToken
                }
            });
            
        }
        catch(error){
            console.error('Registration error:', error);
        
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                // During development, include the full error for debugging
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }

    //04 - Logout
    static async logout(req: Request, res: Response) {
        try {
            // Clear the refresh token cookie
            res.clearCookie('refreshToken', {path: '/'});

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });

        }
        catch (error) {
            // if (error instanceof AppError) {
            //     res.status(error.statusCode).json({
            //         success: false,
            //         message: error.message
            //     });
            // }
            // else {
            //     res.status(500).json({
            //         success: false,
            //         message: 'Internal server error'
            //     });
            // }
            console.error('Registration error:', error);
        
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                // During development, include the full error for debugging
                error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
            });
        }
    }
}