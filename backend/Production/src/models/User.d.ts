import mongoose from "mongoose";
export type UserRole = "learner" | "admin";
export declare const User: mongoose.Model<{
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        role: "learner" | "admin";
        authProvider: "otp" | "google";
        profileComplete: boolean;
        onboardingComplete: boolean;
        totalXP: number;
        level: number;
        streakCount: number;
        phone?: string | null;
        email?: string | null;
        googleSub?: string | null;
        profile?: {
            fullName?: string | null;
            avatarUrl?: string | null;
            school?: string | null;
            age?: number | null;
            standard?: string | null;
            timezone?: string | null;
        } | null;
        lastActiveDate?: string | null;
        wallet?: {
            coins: number;
            diamonds: number;
        } | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        role: "learner" | "admin";
        authProvider: "otp" | "google";
        profileComplete: boolean;
        onboardingComplete: boolean;
        totalXP: number;
        level: number;
        streakCount: number;
        phone?: string | null;
        email?: string | null;
        googleSub?: string | null;
        profile?: {
            fullName?: string | null;
            avatarUrl?: string | null;
            school?: string | null;
            age?: number | null;
            standard?: string | null;
            timezone?: string | null;
        } | null;
        lastActiveDate?: string | null;
        wallet?: {
            coins: number;
            diamonds: number;
        } | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    role: "learner" | "admin";
    authProvider: "otp" | "google";
    profileComplete: boolean;
    onboardingComplete: boolean;
    totalXP: number;
    level: number;
    streakCount: number;
    phone?: string | null;
    email?: string | null;
    googleSub?: string | null;
    profile?: {
        fullName?: string | null;
        avatarUrl?: string | null;
        school?: string | null;
        age?: number | null;
        standard?: string | null;
        timezone?: string | null;
    } | null;
    lastActiveDate?: string | null;
    wallet?: {
        coins: number;
        diamonds: number;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;