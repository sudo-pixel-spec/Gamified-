import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function getDashboardHome(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;