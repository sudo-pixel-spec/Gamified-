import mongoose from "mongoose";
export declare const ChatMessage: mongoose.Model<{
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
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
        role: "user" | "assistant" | "system";
        sessionId: mongoose.Types.ObjectId;
        content: string;
        tokenCount?: number | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        role: "user" | "assistant" | "system";
        sessionId: mongoose.Types.ObjectId;
        content: string;
        tokenCount?: number | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    role: "user" | "assistant" | "system";
    sessionId: mongoose.Types.ObjectId;
    content: string;
    tokenCount?: number | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;