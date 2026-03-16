export declare function ok<T>(data: T): {
    ok: true;
    data: T;
};
export declare function fail(code: string, message: string, details?: unknown): {
    ok: false;
    error: {
        code: string;
        message: string;
        details: unknown;
    };
};