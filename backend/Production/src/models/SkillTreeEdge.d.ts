import mongoose from "mongoose";
export declare const SkillTreeEdge: mongoose.Model<{
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
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
        standardId: mongoose.Types.ObjectId;
        fromNodeId: mongoose.Types.ObjectId;
        toNodeId: mongoose.Types.ObjectId;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        standardId: mongoose.Types.ObjectId;
        fromNodeId: mongoose.Types.ObjectId;
        toNodeId: mongoose.Types.ObjectId;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    standardId: mongoose.Types.ObjectId;
    fromNodeId: mongoose.Types.ObjectId;
    toNodeId: mongoose.Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;