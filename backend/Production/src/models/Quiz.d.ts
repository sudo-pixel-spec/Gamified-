import mongoose from "mongoose";
export declare const Quiz: mongoose.Model<{
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
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
        version: number;
        source: "seed" | "ai";
        published: boolean;
        lessonId: mongoose.Types.ObjectId;
        difficulty: "easy" | "medium" | "hard";
        questions: mongoose.Types.DocumentArray<{
            options: string[];
            qid: string;
            prompt: string;
            answerIndex: number;
            explanation?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            options: string[];
            qid: string;
            prompt: string;
            answerIndex: number;
            explanation?: string | null;
        }, {}, {}> & {
            options: string[];
            qid: string;
            prompt: string;
            answerIndex: number;
            explanation?: string | null;
        }>;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        version: number;
        source: "seed" | "ai";
        published: boolean;
        lessonId: mongoose.Types.ObjectId;
        difficulty: "easy" | "medium" | "hard";
        questions: mongoose.Types.DocumentArray<{
            options: string[];
            qid: string;
            prompt: string;
            answerIndex: number;
            explanation?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            options: string[];
            qid: string;
            prompt: string;
            answerIndex: number;
            explanation?: string | null;
        }, {}, {}> & {
            options: string[];
            qid: string;
            prompt: string;
            answerIndex: number;
            explanation?: string | null;
        }>;
        deletedAt?: NativeDate | null;
        deletedBy?: mongoose.Types.ObjectId | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    version: number;
    source: "seed" | "ai";
    published: boolean;
    lessonId: mongoose.Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    questions: mongoose.Types.DocumentArray<{
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }, {}, {}> & {
        options: string[];
        qid: string;
        prompt: string;
        answerIndex: number;
        explanation?: string | null;
    }>;
    deletedAt?: NativeDate | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;