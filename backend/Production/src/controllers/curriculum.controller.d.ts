import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function getStandards(_req: Request, res: Response): Promise<void>;
export declare function getSubjects(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getUnits(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getChapters(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getLessons(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;