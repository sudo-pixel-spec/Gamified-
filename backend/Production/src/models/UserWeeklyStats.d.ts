import mongoose from "mongoose";
export declare const UserWeeklyStats: mongoose.Model<{
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
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
        userId: mongoose.Types.ObjectId;
        weekStart: string;
        lessonsCompleted: number;
        questionsAttempted: number;
        questionsCorrect: number;
        hardPerfectCount: number;
        eligibleXP: number;
        activeDays: number;
        dailyCapUsed: number;
        suspiciousFlags: string[];
        lastActiveDay?: string | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        userId: mongoose.Types.ObjectId;
        weekStart: string;
        lessonsCompleted: number;
        questionsAttempted: number;
        questionsCorrect: number;
        hardPerfectCount: number;
        eligibleXP: number;
        activeDays: number;
        dailyCapUsed: number;
        suspiciousFlags: string[];
        lastActiveDay?: string | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    userId: mongoose.Types.ObjectId;
    weekStart: string;
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    hardPerfectCount: number;
    eligibleXP: number;
    activeDays: number;
    dailyCapUsed: number;
    suspiciousFlags: string[];
    lastActiveDay?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;