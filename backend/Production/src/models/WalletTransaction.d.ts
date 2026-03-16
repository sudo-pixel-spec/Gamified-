import mongoose from "mongoose";
export declare const WalletTransaction: mongoose.Model<{
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
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
        type: "earn" | "spend";
        userId: mongoose.Types.ObjectId;
        currency: "coins" | "diamonds";
        amount: number;
        reason?: string | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        type: "earn" | "spend";
        userId: mongoose.Types.ObjectId;
        currency: "coins" | "diamonds";
        amount: number;
        reason?: string | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    type: "earn" | "spend";
    userId: mongoose.Types.ObjectId;
    currency: "coins" | "diamonds";
    amount: number;
    reason?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;