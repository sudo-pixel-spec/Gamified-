import mongoose from "mongoose";
export declare const Subject: mongoose.Model<{
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, mongoose.Document<unknown, {}, {
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        name: string;
        standardId: mongoose.Types.ObjectId;
        orderIndex: number;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
    }, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<{
        name: string;
        standardId: mongoose.Types.ObjectId;
        orderIndex: number;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    standardId: mongoose.Types.ObjectId;
    orderIndex: number;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;