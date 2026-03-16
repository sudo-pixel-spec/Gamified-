import mongoose from "mongoose";
export declare const RefreshToken: mongoose.Model<{
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
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
        expiresAt: NativeDate;
        userId: mongoose.Types.ObjectId;
        tokenHash: string;
        createdIp?: string | null;
        revokedAt?: NativeDate | null;
        userAgent?: string | null;
        deviceId?: string | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        expiresAt: NativeDate;
        userId: mongoose.Types.ObjectId;
        tokenHash: string;
        createdIp?: string | null;
        revokedAt?: NativeDate | null;
        userAgent?: string | null;
        deviceId?: string | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    expiresAt: NativeDate;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    createdIp?: string | null;
    revokedAt?: NativeDate | null;
    userAgent?: string | null;
    deviceId?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;