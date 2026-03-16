import mongoose from "mongoose";
export declare const Lesson: mongoose.Model<{
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
}, mongoose.Document<unknown, {}, {
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
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
        tags: string[];
        orderIndex: number;
        chapterId: mongoose.Types.ObjectId;
        title: string;
        bullets: string[];
        published: boolean;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
        videoUrl?: string | null;
        contentText?: string | null;
    }, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<{
        tags: string[];
        orderIndex: number;
        chapterId: mongoose.Types.ObjectId;
        title: string;
        bullets: string[];
        published: boolean;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
        videoUrl?: string | null;
        contentText?: string | null;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    tags: string[];
    orderIndex: number;
    chapterId: mongoose.Types.ObjectId;
    title: string;
    bullets: string[];
    published: boolean;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    videoUrl?: string | null;
    contentText?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;