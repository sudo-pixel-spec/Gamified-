import mongoose from "mongoose";
export declare const Otp: mongoose.Model<{
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
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
        phone: string;
        otpHash: string;
        expiresAt: NativeDate;
        attemptsLeft: number;
        createdIp?: string | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        phone: string;
        otpHash: string;
        expiresAt: NativeDate;
        attemptsLeft: number;
        createdIp?: string | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    phone: string;
    otpHash: string;
    expiresAt: NativeDate;
    attemptsLeft: number;
    createdIp?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;