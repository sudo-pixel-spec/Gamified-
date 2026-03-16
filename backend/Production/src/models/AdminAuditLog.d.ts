import mongoose from "mongoose";
export declare const AdminAuditLog: mongoose.Model<{
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
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
        adminId: mongoose.Types.ObjectId;
        action: string;
        entity: string;
        entityId: mongoose.Types.ObjectId;
        userAgent?: string | null;
        requestId?: string | null;
        ip?: string | null;
        payload?: any;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        adminId: mongoose.Types.ObjectId;
        action: string;
        entity: string;
        entityId: mongoose.Types.ObjectId;
        userAgent?: string | null;
        requestId?: string | null;
        ip?: string | null;
        payload?: any;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    adminId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: mongoose.Types.ObjectId;
    userAgent?: string | null;
    requestId?: string | null;
    ip?: string | null;
    payload?: any;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;