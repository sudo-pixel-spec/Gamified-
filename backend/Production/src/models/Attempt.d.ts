import mongoose from "mongoose";
export declare const Attempt: mongoose.Model<{
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & Omit<{
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
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
        userId: mongoose.Types.ObjectId;
        lessonId: mongoose.Types.ObjectId;
        quizVersion: number;
        answers: mongoose.Types.DocumentArray<{
            qid?: string | null;
            selectedIndex?: number | null;
            correct?: boolean | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            qid?: string | null;
            selectedIndex?: number | null;
            correct?: boolean | null;
        }, {}, {}> & {
            qid?: string | null;
            selectedIndex?: number | null;
            correct?: boolean | null;
        }>;
        score?: number | null;
        totalQuestions?: number | null;
        xpAwarded?: number | null;
        coinsAwarded?: number | null;
        diamondsAwarded?: number | null;
        timeSpentSec?: number | null;
        idempotencyKey?: string | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
        timestamps: true;
    }>> & Omit<{
        userId: mongoose.Types.ObjectId;
        lessonId: mongoose.Types.ObjectId;
        quizVersion: number;
        answers: mongoose.Types.DocumentArray<{
            qid?: string | null;
            selectedIndex?: number | null;
            correct?: boolean | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            qid?: string | null;
            selectedIndex?: number | null;
            correct?: boolean | null;
        }, {}, {}> & {
            qid?: string | null;
            selectedIndex?: number | null;
            correct?: boolean | null;
        }>;
        score?: number | null;
        totalQuestions?: number | null;
        xpAwarded?: number | null;
        coinsAwarded?: number | null;
        diamondsAwarded?: number | null;
        timeSpentSec?: number | null;
        idempotencyKey?: string | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    quizVersion: number;
    answers: mongoose.Types.DocumentArray<{
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }, {}, {}> & {
        qid?: string | null;
        selectedIndex?: number | null;
        correct?: boolean | null;
    }>;
    score?: number | null;
    totalQuestions?: number | null;
    xpAwarded?: number | null;
    coinsAwarded?: number | null;
    diamondsAwarded?: number | null;
    timeSpentSec?: number | null;
    idempotencyKey?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;