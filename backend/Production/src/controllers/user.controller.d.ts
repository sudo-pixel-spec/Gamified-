import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
export declare function getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function completeProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function completeOnboarding(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;