export interface IFMenuBase {
    key: string;
    title: string;
    icon?: string;
    component?: string;
    query?: string;
    requireAuth?: string;
    route?: string;
    /** 是否登录校验，true不进行校验（访客） */
    login?: boolean;
}

export interface IFMenu extends IFMenuBase {
    subs?: IFMenu[];
}

const menus: {
    menus: IFMenu[];
    others: IFMenu[] | [];
    [index: string]: any;
} = {
    menus: [
        // 菜单相关路由

        { key: '/app/class/main', title: '班级和学员管理', icon: 'mobile', component: 'ClassStu' },
        { key: '/app/ranks', title: '排行榜', icon: 'mobile', component: 'Ranks' },
        { key: '/app/dashboard', title: '数据中心', icon: 'mobile', component: 'Dashboard' },
        { key: '/app/errorBook', title: '错词本', icon: 'mobile', component: 'ErrorBook' },
        { key: '/app/queBankCreate', title: '题库建设', icon: 'mobile', component: 'QueBankCreate' },
        {
            key: '/app/test',
            title: '考试中心',
            icon: 'mobile',
            subs: [
                { key: '/app/test/testPaper', title: '试卷管理', icon: 'mobile', component: 'TestPaper' },
                { key: '/app/test/testRank', title: '已发布考试/考试成绩', icon: 'mobile', component: 'TestRank' },
            ]
        },
        {
            key: '/app/writing',
            title: '作文中心',
            icon: 'mobile',
            subs: [
                { key: '/app/writing/writingPaper', title: '作文管理', icon: 'mobile', component: 'WritingPaper' },
                { key: '/app/writing/writingExam', title: '已发布作文/作文成绩', icon: 'mobile', component: 'WritingExam' },
            ]
        },
    ],
    others: [
        { key: '/app/class/main/class', title: '', icon: 'mobile', component: 'MainClass' },
        { key: '/app/class/main/class/set', title: '', icon: 'mobile', component: 'MainSet' },
        { key: '/app/queBankCreate/bankDetail', title: '', icon: 'mobile', component: 'BankDetail' },
        { key: '/app/queBankCreate/bankDetail/questionAdd', title: '', icon: 'mobile', component: 'QuestionAdd' },
		{ key: '/app/queBankCreate/bankDetail/questionAddPack', title: '', icon: 'mobile', component: 'QuestionAddPack' },
        { key: '/app/test/testPaper/testDetail', title: '', icon: 'mobile', component: 'TestDetail' },
        { key: '/app/test/testPaper/stuDetail', title: '', icon: 'mobile', component: 'StuPaperDetail' },
        { key: '/app/test/testRank/stuRank', title: '', icon: 'mobile', component: 'StuRank' },
        { key: '/app/test/testRank/mistakeRank', title: '', icon: 'mobile', component: 'MistakeRank' },
        { key: '/app/writing/writingDetail', title: '作文物料详情', icon: 'mobile', component: 'WritingDetail' },
        { key: '/app/writing/writingExam/examRank', title: '作文成绩排行', icon: 'mobile', component: 'ExamRank' },
        { key: '/app/writing/examDetail', title: '作文成绩详情', icon: 'mobile', component: 'ExamDetail' },
    ], // 非菜单相关路由
};

export default menus;
