import React from 'react';
import { Row, Col, Tabs, DatePicker, Table, Select, Pagination, Calendar } from 'antd';
import locale from 'antd/lib/calendar/locale/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import '../../style/pageStyle/Dashboard.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
// const { Column, ColumnGroup } = Table;
const dateFormat = 'YYYY/MM/DD';
const defaultOptions = {
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        data: [
            {
                name: '当前学员',
                icon: 'rect', // 用矩形替换
            },
            {
                name: '同期综合评分最优学员',
                icon: 'rect',
            },
            {
                name: '同期综合评分最差学员',
                icon: 'rect', // 用矩形替换
            },
            {
                name: '该指标同期平均值',
                icon: 'rect',
            },
        ],
        itemWidth: 40, //矩形宽度
        itemHeight: 2, //矩形高度
        textPosition: 'left',
        left: 'left',
        itemGap: 30,
        align: 'right',
    },
    grid: {
        left: '0',
        right: '0',
        bottom: '0',
        containLabel: true,
    },
    xAxis: {
        type: 'category',
        data: ['2020/01', '2020/02', '2020/03', '2020/04', '2020/05', '2020/06'],
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value}分',
        },
    },
    series: [
        {
            name: '当前学员',
            type: 'line',
            smooth: true,
            data: [0, 0, 0, 0, 0, 0],
        },
        {
            name: '同期综合评分最优学员',
            type: 'line',
            smooth: true,
            data: [0, 0, 0, 0, 0, 0],
        },
        {
            name: '同期综合评分最差学员',
            type: 'line',
            smooth: true,
            data: [0, 0, 0, 0, 0, 0],
        },
        {
            name: '该指标同期平均值',
            type: 'line',
            smooth: true,
            lineStyle: {
                type: 'dashed',
            },
            data: [0, 0, 0, 0, 0, 0],
        },
    ],
    color: ['#0089FF', '#00CF2C', '#FF1010', '#91949A'],
};
const getDefaultOption = () => {
    return JSON.parse(JSON.stringify(defaultOptions));
};
const defaultTestInfo = {
    date: '',
    detail: [
        {
            word: '暂无数据',
            result: '1',
        },
    ],
    passRate: 0,
    reciteCount: 0,
};
(Date.prototype as any).format = function (fmt: any) {
    let o: any = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds(),
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
            );
        }
    }
    return fmt;
};
const FunGetDateStr = (p_count: any, nowDate: any) => {
    let dd = nowDate;
    dd.setDate(dd.getDate() + p_count); //获取p_count天后的日期
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1; //获取当前月份的日期
    let d = dd.getDate();
    return y + '-' + m + '-' + d;
};
const getDateBetween = (start: any, end: any) => {
    var result = [];
    //使用传入参数的时间
    var startTime: any = new Date(start);
    var endTime: any = new Date(end);
    while (endTime - startTime >= 0) {
        let year = startTime.getFullYear();
        let month = startTime.getMonth();
        month = month < 9 ? '0' + (month + 1) : month + 1;
        let day =
            startTime.getDate().toString().length === 1
                ? '0' + startTime.getDate()
                : startTime.getDate();
        //加入数组
        result.push(year + '-' + month + '-' + day);
        //更新日期
        startTime.setDate(startTime.getDate() + 1);
    }
    return result;
};

const getyAxisBetween = (key: any) => {
    let label = '';
    switch (key) {
        case 'score':
            label = '分';
            break;
        case 'test_pass_rate':
            label = '%';
            break;
        case 'study_time':
            label = '小时';
            break;
        case 'recite_count':
            label = '个';
            break;
        case 'stage_test_pass_rate':
            label = '%';
            break;
        default:
            break;
    }
    return '{value}' + label;
};

let instance: any;
class Dashboard extends React.Component {
    state = {
        teacher: [],
        selTeacher: {
            teacherId: 0,
            realName: '',
        },
        pici: [],
        selPici: 0,
        banji: [],
        selBanji: '',
        semester: [],
        selSemester: [],
        stu: [],
        selStu: '',
        pageNo: 1,
        baseInfo: {
            baseScore: '',
            endDescribe: '',
            reciteCount: '',
            studentName: '',
        },
        type: 'score',
        centerData: {},
        mydate1: (new Date(FunGetDateStr(-5, new Date()) + ' 00:00:00') as any).format(
            'yyyy-MM-dd'
        ),
        mydate2: (new Date() as any).format('yyyy-MM-dd'),
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '单词',
                dataIndex: 'word',
                key: 'word',
            },
            {
                title: '错误次数',
                dataIndex: 'count',
                key: 'count',
            },
        ],
        data1: [],
        columns2: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '单词',
                dataIndex: 'word',
                key: 'word',
            },
            {
                title: '错误次数',
                dataIndex: 'count',
                key: 'count',
            },
        ],
        data2: [],
        wordArr: [
            {
                word: '暂无数据',
                state: true,
            },
            {
                word: '暂无数据',
                state: false,
            },
            {
                word: '暂无数据',
                state: true,
            },
            {
                word: '暂无数据',
                state: true,
            },
            {
                word: '暂无数据',
                state: true,
            },
            {
                word: '暂无数据',
                state: false,
            },
            {
                word: '暂无数据s',
                state: true,
            },
            {
                word: '暂无数据s',
                state: true,
            },
            {
                word: '暂无数据s',
                state: true,
            },
            {
                word: '暂无数据',
                state: true,
            },
            {
                word: '暂无数据',
                state: true,
            },
            {
                word: '暂无数据',
                state: false,
            },
        ],
        nowPag: 1,
        allCount: 10,
        options: getDefaultOption(),
        testInfo: defaultTestInfo,
        sketchInfo: {
            prevReciteStatistics: [],
            reciteStatistics: [],
            nextReciteStatistics: [],
        },
        calendarSelectedMouth: moment().month(),
        calendarSelectedYear: moment().year(),
        calendarSelectedDate: moment(),
    };
    componentWillMount() {
        this.inited();
    }
    echartsReact = React.createRef();
    async inited() {
        // let userid = await this.login();
        let { options, mydate1, mydate2, calendarSelectedMouth, calendarSelectedYear } = this.state;
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        const pici = await this.getPici(selTeacher.teacherId);
        const banji = await this.getClass(pici[0].batchId);
        const stu = await this.getStu(banji[0]?.classId, pici[0].batchId);
        const semester = await this.getSemester(banji[0].classId || 0);
        const selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : [];
        this.setState({
            teacher,
            pici,
            banji,
            stu,
            semester,
            selTeacher,
            selPici: pici[0].batchId,
            selBanji: banji[0].classId,
            selSemester,
            options,
        });
        if(stu.length === 0) return 
        const baseInfo = await this.baseInfo(stu[0] ? stu[0].studentId : 0, selSemester);
        const wrongInfo = await this.wrongBook({
            batchId: pici[0].batchId,
            classId: banji[0].classId,
            studentId: stu[0].studentId,
            selSemester,
            pageVal: 1,
        });
        let data1 = [];
        let data2 = [];
        let allCount;
        if (wrongInfo != null && wrongInfo.detail !== null) {
            data1 = wrongInfo.detail.slice(0, 10).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count,
                };
            });
            data2 = wrongInfo.detail.slice(10, 20).map((val: any, index: number) => {
                return {
                    key: index + 11,
                    word: val.word,
                    count: val.count,
                };
            });
            allCount = wrongInfo.totalPage;
        }
        const centerData = await this.getChart({
            batchId: pici[0].batchId,
            classId: banji[0].classId,
            studentId: stu[0].studentId,
            selSemester,
            startDate: mydate1,
            endDate: mydate2,
        });
        options.series[0].data = centerData.personal;
        options.series[1].data = centerData.best;
        options.series[2].data = centerData.worst;
        options.series[3].data = centerData.average;
        options.xAxis.data = getDateBetween(mydate1, mydate2);
        let testInfo = await this.getTest({
            batchId: pici[0].batchId,
            classId: banji[0].classId,
            studentId: stu[0].studentId,
            selSemester,
            testDate: (new Date() as any).format('yyyy-MM-dd'),
        });
        testInfo.detail = testInfo.detail
            ? testInfo.detail
            : [
                  {
                      word: '暂无数据',
                      result: '1',
                  },
              ];
        this.handleSketch(
            pici[0].batchId,
            banji[0].classId,
            stu[0].studentId,
            selSemester,
            calendarSelectedMouth,
            calendarSelectedYear
        );
        this.setState({
            teacher,
            pici,
            banji,
            stu,
            semester,
            selTeacher,
            selPici: pici[0].batchId,
            selBanji: banji[0].classId,
            selStu: stu[0].studentId,
            selSemester,
            baseInfo,
            data1,
            data2,
            allCount,
            options,
            testInfo,
        });
        if (this.echartsReact != null) {
            instance = (this.echartsReact as any).getEchartsInstance();
            instance.clear();
            instance.setOption(options, true);
        }
    }
    async onDateChange(value: any) {
        const { selPici, selBanji, selStu, selSemester} = this.state;
        console.log('onPanelChange');
        let testInfo = await this.getTest({
            batchId: selPici,
            classId: selBanji,
            selSemester,
            studentId: selStu,
            testDate: moment(value).format('YYYY-MM-DD'),
        });
        testInfo.detail = testInfo.detail
            ? testInfo.detail
            : [
                  {
                      word: '暂无数据',
                      result: '1',
                  },
              ];
        this.setState({
            testInfo,
            calendarSelectedDate: moment(value),
        });
    }
    tabCallback(key: any) {
        this.setState(
            {
                type: key,
            },
            async () => {
                let { selPici, selBanji, selStu, selSemester, options, mydate2, mydate1 } = this.state;
                const centerData = await this.getChart({
                    batchId: selPici,
                    classId: selBanji,
                    studentId: selStu,
                    selSemester,
                    startDate: mydate1,
                    endDate: mydate2,
                });
                options.series[0].data = centerData.personal;
                options.series[1].data = centerData.best;
                options.series[2].data = centerData.worst;
                options.series[3].data = centerData.average;
                options.xAxis.data = getDateBetween(mydate1, mydate2);
                options.yAxis.axisLabel.formatter = getyAxisBetween(key);
                this.setState({
                    options,
                    mydate1,
                    mydate2,
                });
                instance.clear();
                instance.setOption(options, true);
            }
        );
        console.log(key);
    }
    async nowPagChange(val: any) {
        let { selPici, selBanji, selStu, selSemester, pageNo } = this.state;
        let pageVal = val;
        this.setState({
            pageNo: val,
        });
        const wrongInfo = await this.wrongBook({
            batchId: selPici,
            classId: selBanji,
            studentId: selStu,
            selSemester,
            pageVal,
        });

        let data1 = [];
        let data2 = [];
        let allCount;
        if (wrongInfo != null && wrongInfo.detail !== null) {
            data1 = wrongInfo.detail.slice(0, 10).map((val: any, index: number) => {
                return {
                    key: pageVal * 20 + index - 19,
                    word: val.word,
                    count: val.count,
                };
            });
            data2 = wrongInfo.detail.slice(10, 20).map((val: any, index: number) => {
                return {
                    key: pageVal * 20 + index - 9,
                    word: val.word,
                    count: val.count,
                };
            });
            allCount = wrongInfo.totalPage;
        }
        this.setState({
            nowPag: val,
            data1,
            data2,
            allCount,
        });
    }
    async dataChange(data: any) {
        let { selPici, selBanji, selStu, selSemester, options, mydate2, mydate1 } = this.state;
        if (!data) {
            return;
        }
        mydate1 = (new Date(data[0]._d) as any).format('yyyy-MM-dd');
        mydate2 = (new Date(data[1]._d) as any).format('yyyy-MM-dd');
        console.log(
            (new Date(data[0]._d) as any).format('yyyy-MM-dd'),
            (new Date(data[1]._d) as any).format('yyyy-MM-dd')
        );
        const centerData = await this.getChart({
            batchId: selPici,
            classId: selBanji,
            studentId: selStu,
            selSemester,
            startDate: mydate1,
            endDate: mydate2,
        });
        options.series[0].data = centerData.personal;
        options.series[1].data = centerData.best;
        options.series[2].data = centerData.worst;
        options.series[3].data = centerData.average;
        options.xAxis.data = getDateBetween(mydate1, mydate2);
        this.setState({
            options,
            mydate1,
            mydate2,
        });
        instance.setOption(options);
    }
    async getTest(params: any) {
        let res = await get({
            url:
                baseUrl +
                `/api/v1/data-center/test-paper-result?batchId=${params.batchId}&classId=${params.classId}&semesters=${JSON.stringify(params.selSemester)}&studentId=${params.studentId}&date=${params.testDate}`,
        });
        return res ? res.data : null;
    }
    async getSketch(params: any) {
        let res = await get({
            url:
                baseUrl +
                `/api/v1/data-center/recite-statistics?batchId=${params.batchId}&classId=${
                    params.classId
                }&semesters=${JSON.stringify(params.selSemester)}&studentId=${params.studentId}&year=${params.calendarSelectedYear}&month=${
                    params.calendarSelectedMouth + 1
                }`,
        });
        console.log(res.data);
        return res ? res.data : null;
    }
    async getChart(params: any) {
        const { type } = this.state;
        let res = await get({
            url:
                baseUrl +
                `/api/v1/data-center/score-statistics?batchId=${params.batchId}&semesters=${JSON.stringify(params.selSemester)}&classId=${params.classId}&studentId=${params.studentId}&type=${type}&startDate=${params.startDate}&endDate=${params.endDate}`,
        });
        return res ? res.data : null;
    }
    async wrongBook(params: any) {
        let res = await get({
            url:
                baseUrl +
                `/api/v1/data-center/wrong-book?batchId=${params.batchId}&classId=${params.classId}&semesters=${JSON.stringify(params.selSemester)}&studentId=${params.studentId}&pageSize=20&pageNo=${params.pageVal}`,
        });
        return res ? res.data : null;
    }
    async baseInfo(stuid: string, selSemester: any) {
        let res = await get({ url: baseUrl + `/api/v1/data-center/base-info?studentId=${stuid}&semesters=${JSON.stringify(selSemester)}` });
        return res ? res.data : null;
    }
    async login() {
        let res = await post({
            url: baseUrl + '/api/v1/auth/login',
            data: {
                userName: 'yooky',
                password: '123',
            },
        });
        return res;
    }
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list`});
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }
    async getPici(teacherId: any) {
        let res = await get({ url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}` });
        console.log('批次', res);
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }
    async getClass(pici: any) {
        let res = await get({
            url: baseUrl + `/api/v1/structure/class/list?batchId=${pici}&category=sc&pageNo=1&pageSize=100`,
        });
        const banji = res?.data?.classList ?? [];
        banji.unshift({
            classCode: '',
            classId: 0,
            createDate: '',
            describe: '全部',
            studentCount: 0,
        });
        return banji;
    }
    async getStu(banji: any, pici?: any) {
        const { selPici } = this.state;
		const realPici = pici || selPici;
        let res = await get({
            url: baseUrl + `/api/v1/structure/user/list?batchId=${realPici}&classId=${banji}`,
        });
        console.log('学生', res);
        return res?.data?.detail || [];
    }
    async getSemester(classId: any){
        const {selPici, selTeacher} = this.state
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${classId}`
        })
        const semester = res?.data || [];
        semester.unshift({
            isCurrent: false,
            semesterId: 0,
            semesterName: '全部',
        });
        return semester;
    }
    async handleTeacher (val:any){
        console.log('handleTeacher', val)
        const { teacher } = this.state;
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === val
        });
        const res = await this.getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        this.setState({
            selTeacher,
            pici: res,
        });
        this.handlePiCi(pici);
    }
    async handlePiCi(val: any) {
        const res = await this.getClass(val);
        const selBanji = res[0] ? res[0].classId : 0;
        this.setState({
            selPici: val,
            banji: res,
        });
        this.handleBanji(selBanji);
    }

    async handleBanji(val: any) {
        let res = await this.getStu(val);
        let selStu = res[0] ? res[0].studentId : 0;
        const semester = await this.getSemester(val);
        const selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : [];
        this.setState({
            selBanji: val,
            stu: res,
            selStu,
            semester,
            selSemester
        });
        this.handleSemester(selSemester);
    }

    async handleStu(val: any) {
        let {
            selPici,
            selBanji,
            selStu,
            selSemester,
            options,
            mydate2,
            mydate1,
            calendarSelectedMouth,
            calendarSelectedYear,
        } = this.state;
        if (val == 0) {
            let newDefaultOption = getDefaultOption();
            if (this.echartsReact != null) {
                instance.clear();
                let date1 = (new Date(FunGetDateStr(-5, new Date()) + ' 00:00:00') as any).format(
                    'yyyy-MM-dd'
                );
                let date2 = (new Date() as any).format('yyyy-MM-dd');
                newDefaultOption.xAxis.data = getDateBetween(date1, date2);
                instance.setOption(newDefaultOption, true);
            }
            this.setState({
                selStu: '',
                baseInfo: {
                    baseScore: '',
                    endDescribe: '',
                    reciteCount: '',
                    studentName: '',
                },
                data1: [],
                data2: [],
                options: newDefaultOption,
                testInfo: defaultTestInfo,
                calendarSelectedMouth: moment().month(),
                calendarSelectedYear: moment().year(),
                calendarSelectedDate: moment(),
            });
            return;
        }

        const baseInfo = await this.baseInfo(val, selSemester);
        const wrongInfo = await this.wrongBook({
            batchId: selPici,
            classId: selBanji,
            studentId: val,
            selSemester,
            pageVal: 1,
        });
        let data1 = [];
        let data2 = [];
        if (wrongInfo != null && wrongInfo.detail != null) {
            data1 = wrongInfo.detail.slice(0, 10).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count,
                };
            });
            data2 = wrongInfo.detail.slice(10, 20).map((val: any, index: number) => {
                return {
                    key: index + 11,
                    word: val.word,
                    count: val.count,
                };
            });
        }
        const centerData = await this.getChart({
            batchId: selPici,
            classId: selBanji,
            studentId: val,
            selSemester,
            startDate: mydate1,
            endDate: mydate2,
        });
        options.series[0].data = centerData.personal;
        options.series[1].data = centerData.best;
        options.series[2].data = centerData.worst;
        options.series[3].data = centerData.average;
        options.xAxis.data = getDateBetween(mydate1, mydate2);
        let testInfo = await this.getTest({
            batchId: selPici,
            classId: selBanji,
            selSemester,
            studentId: val,
            testDate: (new Date() as any).format('yyyy-MM-dd'),
        });
        testInfo.detail = testInfo.detail
            ? testInfo.detail
            : [
                  {
                      word: '暂无数据',
                      result: '1',
                  },
              ];
        this.handleSketch(selPici, selBanji, val, selSemester, moment().month(), moment().year());
        this.setState({
            selStu: val,
            baseInfo,
            data1,
            data2,
            options,
            testInfo,
            calendarSelectedMouth: moment().month(),
            calendarSelectedYear: moment().year(),
            calendarSelectedDate: moment(),
        });
        instance.clear();
        instance.setOption(options, true);
        console.log(val);
    }
    async handleSemester(val: any){
        const { selStu } = this.state;
        this.setState({
            selSemester: val,
        });
        setTimeout(()=>{
            this.handleStu(selStu);
        }, 0)
    }

    async handleSketch(
        batchId: any,
        classId: any,
        studentId: any,
        selSemester: any,
        calendarSelectedMouth: any,
        calendarSelectedYear: any
    ) {
        let prevCalendarSelectedMouth = calendarSelectedMouth - 1;
        let prevCalendarSelectedYear = calendarSelectedYear;

        let nextCalendarSelectedMouth = calendarSelectedMouth + 1;
        let nextCalendarSelectedYear = calendarSelectedYear;
        if (calendarSelectedMouth == 0) {
            prevCalendarSelectedMouth = 11;
            prevCalendarSelectedYear = calendarSelectedYear - 1;
        } else if (calendarSelectedMouth == 11) {
            nextCalendarSelectedMouth = 0;
            nextCalendarSelectedYear = calendarSelectedYear + 1;
        }
        let prevSketchItem = await this.getSketch({
            batchId,
            classId,
            studentId,
            selSemester,
            calendarSelectedMouth: prevCalendarSelectedMouth,
            calendarSelectedYear: prevCalendarSelectedYear,
        });
        let currentSketchItem = await this.getSketch({
            batchId,
            classId,
            studentId,
            selSemester,
            calendarSelectedMouth,
            calendarSelectedYear,
        });
        let nextSketchItem = await this.getSketch({
            batchId,
            classId,
            studentId,
            selSemester,
            calendarSelectedMouth: nextCalendarSelectedMouth,
            calendarSelectedYear: nextCalendarSelectedYear,
        });
        let sketchInfo = {
            reciteStatistics: currentSketchItem.reciteStatistics,
            prevReciteStatistics: prevSketchItem.reciteStatistics,
            nextReciteStatistics: nextSketchItem.reciteStatistics,
        };
        console.log('calendarSelectedMouth', calendarSelectedMouth);
        this.setState({
            sketchInfo,
        });
    }

    onCalendarGoPrev(value: any, onChange: any) {
        const { selPici, selBanji, selStu, selSemester, sketchInfo } = this.state;
        const month = value.month();
        const year = value.year();
        const newValue = value.clone();
        if (month == 0) {
            newValue.year(year - 1);
            newValue.month(11);
        } else {
            newValue.month(month - 1);
        }
        let prevSketchInfo = {
            prevReciteStatistics: [],
            reciteStatistics: sketchInfo.prevReciteStatistics,
            nextReciteStatistics: sketchInfo.reciteStatistics,
        };
        this.setState({
            calendarSelectedMouth: newValue.month(),
            calendarSelectedYear: newValue.year(),
            sketchInfo: prevSketchInfo,
        });
        this.handleSketch(selPici, selBanji, selStu, selSemester, newValue.month(), newValue.year());
        console.log('newValue', newValue.format('YYYY-MM-DD'));
        onChange(newValue);
    }

    onCalendarGoNext(value: any, onChange: any) {
        const { selPici, selBanji, selSemester, selStu, sketchInfo } = this.state;
        const month = value.month();
        const year = value.year();
        const newValue = value.clone();
        if (month == 11) {
            newValue.year(year + 1);
            newValue.month(0);
        } else {
            newValue.month(month + 1);
        }
        let nextSketchInfo = {
            prevReciteStatistics: sketchInfo.reciteStatistics,
            reciteStatistics: sketchInfo.nextReciteStatistics,
            nextReciteStatistics: [],
        };
        this.setState({
            calendarSelectedMouth: newValue.month(),
            calendarSelectedYear: newValue.year(),
            sketchInfo: nextSketchInfo,
        });
        this.handleSketch(selPici, selBanji, selStu, selSemester, newValue.month(), newValue.year());
        console.log('newValue', newValue.format('YYYY-MM-DD'));
        onChange(newValue);
    }

    render() {
        const {
            teacher,
            selTeacher,
            pici,
            selPici,
            banji,
            selBanji,
            semester,
            selSemester,
            stu,
            selStu,
            baseInfo,
            columns1,
            data1,
            columns2,
            data2,
            options,
            testInfo,
            nowPag,
            allCount,
            sketchInfo,
            calendarSelectedMouth,
            calendarSelectedYear,
            calendarSelectedDate,
        } = this.state;
        return (
            <div className="gutter-example button-demo main-wrapper">
                {/* <BreadcrumbCustom /> */}
                <div className="mains">
                    <div className="fir">数据中心</div>
                    <div className="sec">
                        <span className="span">执教教师:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selTeacher?.realName || (teacher[0] && (teacher[0] as any).realName) || '请选择'}
                            onChange={this.handleTeacher.bind(this)}
                        >
                            {teacher.map((item: any) => (
                                <Option key={item.teacherId} value={item.teacherId}>
                                    {item.realName}
                                </Option>
                            ))}
                        </Select>
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPici || (pici[0] && (pici[0] as any).describe) || '请选择'}
                            onChange={this.handlePiCi.bind(this)}
                        >
                            {pici.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span">班级:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selBanji || (banji[0] && (banji[0] as any).describe) || '请选择'}
                            onChange={this.handleBanji.bind(this)}
                        >
                            {banji.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span">阶段:</span>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: 180 }}
                            value={selSemester}
                            onChange={this.handleSemester.bind(this)}
                        >
                            {semester.map((item: any) => (
                                <Option key={item.semesterId} value={item.semesterId}>
                                    {item.semesterName || item.semesterId}
                                </Option>
                            ))}
                        </Select>
                        <span className="span">学员:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selStu || (stu[0] && (stu[0] as any).describe) || '请选择'}
                            onChange={this.handleStu.bind(this)}
                        >
                            {stu.map((item: any) => (
                                <Option key={item.studentId} value={item.studentId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <Row gutter={[30, 0]}>
                    <Col span={16}>
                        <div className="score-word">
                            <div className="left">
                                <span className="label">当前学生：</span>
                                <span className="num">{baseInfo.studentName}</span>
                            </div>
                            <div className="right">
                                <span className="label">综合评分：</span>
                                <span className="num">{(+baseInfo.baseScore).toFixed(2)}</span>
                                <span className="word">分</span>
                            </div>
                            <div className="right">
                                <span className="label">累计背词：</span>
                                <span className="num">{baseInfo.reciteCount}</span>
                                <span className="word">词</span>
                            </div>
                        </div>
                        <div className="line-chart">
                            <Tabs defaultActiveKey="score" onChange={this.tabCallback.bind(this)}>
                                <TabPane tab="综合评分趋势" key="score" />
                                <TabPane tab="测试通过率" key="pass_rate" />
                                <TabPane tab="每日学习时长" key="study_time" />
                                <TabPane tab="每日背词数" key="recite_count" />
                                <TabPane tab="单词阶段考通过率" key="spt_pass_rate" />
                            </Tabs>
                            <div className="tab-content">
                                <div className="content">
                                    <span>时间：</span>
                                    <RangePicker
                                        defaultValue={[
                                            moment(
                                                new Date(
                                                    FunGetDateStr(-5, new Date()) + ' 00:00:00'
                                                ),
                                                dateFormat
                                            ),
                                            moment(new Date(), dateFormat),
                                        ]}
                                        onChange={this.dataChange.bind(this)}
                                        format={dateFormat}
                                    />
                                </div>
                                <ReactEcharts
                                    ref={(e) => {
                                        (this.echartsReact as any) = e;
                                    }}
                                    option={options}
                                    style={{ height: '260px', width: '100%' }}
                                    className={'react_for_echarts'}
                                />
                            </div>
                        </div>
                        <div className="error-title">错词本</div>
                        <div className="error-wrapper">
                            <div className="error-content">
                                <div className="left">
                                    <Table
                                        columns={columns1}
                                        dataSource={data1}
                                        pagination={false}
                                        size={'middle'}
                                        bordered={false}
                                    />
                                </div>
                                <div className="right">
                                    <Table
                                        columns={columns2}
                                        dataSource={data2}
                                        pagination={false}
                                        size={'middle'}
                                        bordered={false}
                                    />
                                </div>
                            </div>
                            <div className={data1.length ? 'pag' : 'display-none'}>
                                <Pagination
                                    defaultCurrent={1}
                                    defaultPageSize={20}
                                    current={nowPag}
                                    total={allCount * 20}
                                    onChange={this.nowPagChange.bind(this)}
                                />
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="distance-fir">
                            <div>
                                <span className="distance-fir-text">打卡天数：</span>
                                {baseInfo.endDescribe}
                            </div>
                        </div>
                        <div className="calendar-area">
                            <div>
                                <div className="site-calendar-demo-card">
                                    <Calendar
                                        fullscreen={false}
                                        value={calendarSelectedDate}
                                        locale={locale}
                                        onChange={this.onDateChange.bind(this)}
                                        headerRender={({ value, type, onChange, onTypeChange }) => {
                                            const month = value.month();
                                            const year = value.year();
                                            return (
                                                <div className="custom-header">
                                                    <div
                                                        className="left-icon"
                                                        onClick={this.onCalendarGoPrev.bind(
                                                            this,
                                                            value,
                                                            onChange
                                                        )}
                                                    />
                                                    <div className="current-date-title">
                                                        {`${String(year)}年  ${String(
                                                            month + 1
                                                        )}月`}
                                                    </div>
                                                    <div
                                                        className="right-icon"
                                                        onClick={this.onCalendarGoNext.bind(
                                                            this,
                                                            value,
                                                            onChange
                                                        )}
                                                    />
                                                </div>
                                            );
                                        }}
                                        dateFullCellRender={(value) => {
                                            let className = 'date-level-0';
                                            let currentDayReciteStatistics = 0;
                                            if (moment(value).month() == calendarSelectedMouth) {
                                                currentDayReciteStatistics =
                                                    sketchInfo.reciteStatistics[
                                                        moment(value).date() - 1
                                                    ];
                                            } else if (
                                                moment(value).month() ==
                                                    calendarSelectedMouth - 1 ||
                                                (moment(value).month() == 11 &&
                                                    calendarSelectedMouth == 0)
                                            ) {
                                                currentDayReciteStatistics =
                                                    sketchInfo.prevReciteStatistics[
                                                        moment(value).date() - 1
                                                    ];
                                            } else if (
                                                moment(value).month() ==
                                                    calendarSelectedMouth + 1 ||
                                                (moment(value).month() == 0 &&
                                                    calendarSelectedMouth == 11)
                                            ) {
                                                currentDayReciteStatistics =
                                                    sketchInfo.nextReciteStatistics[
                                                        moment(value).date() - 1
                                                    ];
                                            }

                                            if (currentDayReciteStatistics == 0) {
                                                className = 'date-level-0';
                                            } else if (
                                                currentDayReciteStatistics > 0 &&
                                                currentDayReciteStatistics <= 12
                                            ) {
                                                className = 'date-level-1';
                                            } else if (
                                                currentDayReciteStatistics > 12 &&
                                                currentDayReciteStatistics <= 24
                                            ) {
                                                className = 'date-level-2';
                                            } else if (
                                                currentDayReciteStatistics > 24 &&
                                                currentDayReciteStatistics <= 36
                                            ) {
                                                className = 'date-level-3';
                                            } else if (currentDayReciteStatistics > 36) {
                                                className = 'date-level-4';
                                            }
                                            let dateClassName = 'date-level-area';
                                            if (
                                                moment(value).format('YYYY-MM-DD') ==
                                                calendarSelectedDate.format('YYYY-MM-DD')
                                            ) {
                                                dateClassName = 'date-level-area-selection';
                                            } else if (
                                                moment(value).format('YYYY-MM-DD') ==
                                                moment().format('YYYY-MM-DD')
                                            ) {
                                                dateClassName = 'date-level-area-today';
                                            }
                                            return (
                                                <div className={dateClassName}>
                                                    <div className={`date-level-item ${className}`}>
                                                        {moment(value).date()}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="word-area">
                            <div className="word-title">{testInfo.date}</div>
                            <div className="word-content">
                                <div className="left">
                                    <div className="main">
                                        <span className="big">{testInfo.reciteCount}</span>
                                        <span className="small">个</span>
                                    </div>
                                    <div className="sub">当日背词数</div>
                                </div>
                                <div className="right">
                                    <div className="main">
                                        <span className="big">
                                            {(testInfo.passRate * 100).toFixed(0)}
                                        </span>
                                        <span className="small">%</span>
                                    </div>
                                    <div className="sub">当日测试通过率</div>
                                </div>
                            </div>
                            <div className="list-wrap">
                                <div className="left">
                                    <div className="list">
                                        {testInfo.detail
                                            .slice(0, Math.ceil(testInfo.detail.length / 2))
                                            .map((val, index) => {
                                                return (
                                                    <div
                                                        className={val.result ? 'yes' : 'no'}
                                                        key={index}
                                                    >
                                                        {index + 1}.{val.word}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="list">
                                        {testInfo.detail
                                            .slice(
                                                Math.ceil(testInfo.detail.length / 2),
                                                testInfo.detail.length
                                            )
                                            .map((val, index) => {
                                                return (
                                                    <div
                                                        className={val.result ? 'yes' : 'no'}
                                                        key={index}
                                                    >
                                                        {index +
                                                            Math.ceil(testInfo.detail.length / 2) +
                                                            1}
                                                        .{val.word}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Dashboard;
