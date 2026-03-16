import mongoose from "mongoose";
export declare const UserDailyUsage: mongoose.Model<{
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
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
        date: string;
        userId: mongoose.Types.ObjectId;
        aiMessages: number;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        date: string;
        userId: mongoose.Types.ObjectId;
        aiMessages: number;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    date: string;
    userId: mongoose.Types.ObjectId;
    aiMessages: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;