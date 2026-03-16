import type { Request, Response } from "express";
export declare function requestOtp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function verifyOtp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function googleSignIn(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;