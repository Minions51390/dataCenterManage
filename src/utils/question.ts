export const replaceBlankReg = /\\([A-Z]*\\)/g;

export const enum QuestionType {
    Choice = 'choice',
    Pack = 'pack',
    LongReading = 'long_reading',
    CfReading = 'cf_reading',
    All = 'all',
}

export const getErrorCount = (setType: QuestionType, data: any) => {
    if (setType === QuestionType.Choice) {
        return data.errorCount;
    }

    if (setType === QuestionType.Pack) {
        return data.errorCount.reduce((prev: number, cur: number) => prev + cur);
    }

    if (setType === QuestionType.LongReading || setType === QuestionType.CfReading) {
        return data.questions.reduce((prev: number, cur: any) => prev + cur.errorCount, 0);
    }
}