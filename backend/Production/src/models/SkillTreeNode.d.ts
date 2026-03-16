import mongoose from "mongoose";
export declare const SkillTreeNode: mongoose.Model<{
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
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
        type: "lesson" | "quiz" | "challenge" | "milestone";
        standardId: mongoose.Types.ObjectId;
        orderIndex: number;
        title: string;
        published: boolean;
        lessonId: mongoose.Types.ObjectId;
        xpReward: number;
        iconEmoji: string;
        description?: string | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        type: "lesson" | "quiz" | "challenge" | "milestone";
        standardId: mongoose.Types.ObjectId;
        orderIndex: number;
        title: string;
        published: boolean;
        lessonId: mongoose.Types.ObjectId;
        xpReward: number;
        iconEmoji: string;
        description?: string | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    type: "lesson" | "quiz" | "challenge" | "milestone";
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    title: string;
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    xpReward: number;
    iconEmoji: string;
    description?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;