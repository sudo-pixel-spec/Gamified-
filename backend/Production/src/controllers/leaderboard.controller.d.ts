import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function weeklyGrowth(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function mastery(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;