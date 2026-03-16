import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function submitAttempt(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;