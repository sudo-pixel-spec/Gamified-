import mongoose from "mongoose";
export declare const Standard: mongoose.Model<{
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, mongoose.Document<unknown, {}, {
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    code: string;
    name: string;
    active: boolean;
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
        code: string;
        name: string;
        active: boolean;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
    }, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<{
        code: string;
        name: string;
        active: boolean;
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
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    code: string;
    name: string;
    active: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;