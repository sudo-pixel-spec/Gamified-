export declare function seedCurriculumStd8(): Promise<{
    standards: {
        std8: import("mongoose").Document<unknown, {}, {
            code: string;
            name: string;
            active: boolean;
            deletedAt?: NativeDate | null;
            deletedBy?: import("mongoose").Types.ObjectId | null;
        }, {
            id: string;
        }, import("mongoose").DefaultSchemaOptions> & Omit<{
            code: string;
            name: string;
            active: boolean;
            deletedAt?: NativeDate | null;
            deletedBy?: import("mongoose").Types.ObjectId | null;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, "id"> & {
            id: string;
        };
        std9: import("mongoose").Document<unknown, {}, {
            code: string;
            name: string;
            active: boolean;
            deletedAt?: NativeDate | null;
            deletedBy?: import("mongoose").Types.ObjectId | null;
        }, {
            id: string;
        }, import("mongoose").DefaultSchemaOptions> & Omit<{
            code: string;
            name: string;
            active: boolean;
            deletedAt?: NativeDate | null;
            deletedBy?: import("mongoose").Types.ObjectId | null;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, "id"> & {
            id: string;
        };
        std10: import("mongoose").Document<unknown, {}, {
            code: string;
            name: string;
            active: boolean;
            deletedAt?: NativeDate | null;
            deletedBy?: import("mongoose").Types.ObjectId | null;
        }, {
            id: string;
        }, import("mongoose").DefaultSchemaOptions> & Omit<{
            code: string;
            name: string;
            active: boolean;
            deletedAt?: NativeDate | null;
            deletedBy?: import("mongoose").Types.ObjectId | null;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, "id"> & {
            id: string;
        };
    };
    subject: import("mongoose").Document<unknown, {}, {
        name: string;
        standardId: import("mongoose").Types.ObjectId;
        orderIndex: number;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
    }, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<{
        name: string;
        standardId: import("mongoose").Types.ObjectId;
        orderIndex: number;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    };
    unit: import("mongoose").Document<unknown, {}, {
        name: string;
        orderIndex: number;
        subjectId: import("mongoose").Types.ObjectId;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
    }, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<{
        name: string;
        orderIndex: number;
        subjectId: import("mongoose").Types.ObjectId;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    };
    chapter: import("mongoose").Document<unknown, {}, {
        name: string;
        orderIndex: number;
        unitId: import("mongoose").Types.ObjectId;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
    }, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<{
        name: string;
        orderIndex: number;
        unitId: import("mongoose").Types.ObjectId;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    };
    lessons: (import("mongoose").Document<unknown, {}, {
        tags: string[];
        orderIndex: number;
        chapterId: import("mongoose").Types.ObjectId;
        title: string;
        bullets: string[];
        published: boolean;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
        videoUrl?: string | null;
        contentText?: string | null;
    }, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<{
        tags: string[];
        orderIndex: number;
        chapterId: import("mongoose").Types.ObjectId;
        title: string;
        bullets: string[];
        published: boolean;
        deletedAt?: NativeDate | null;
        deletedBy?: import("mongoose").Types.ObjectId | null;
        videoUrl?: string | null;
        contentText?: string | null;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    })[];
}>;