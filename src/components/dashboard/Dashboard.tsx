import React from 'react';
import { Row, Col, Tabs, DatePicker, Table, Select, Pagination, Calendar} from 'antd';
import locale from 'antd/lib/calendar/locale/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
// import BreadcrumbCustom from '../widget/BreadcrumbCustom';
// import EchartsViews from './EchartsViews';
// import EchartsProjects from './EchartsProjects';
// import b1 from '../../style/imgs/b1.png';
// import {
//     CloudOutlined,
//     HeartOutlined,
//     MailOutlined,
//     SyncOutlined,
//     SnippetsOutlined,
// } from '@ant-design/icons';
import '../../style/pageStyle/Dashboard.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
// const { Column, ColumnGroup } = Table;
const dateFormat = 'YYYY/MM/DD';
let values = {
    '2016-01-23': 1,
    '2016-01-26': 2,
    '2016-01-27': 3,
    '2016-01-28': 4,
    '2016-01-29': 4,
    '2016-02-23': 1,
    '2016-02-26': 2,
    '2016-02-27': 3,
    '2016-02-28': 4,
    '2016-02-29': 4,
    '2016-03-23': 1,
    '2016-03-26': 2,
    '2016-03-27': 3,
    '2016-03-28': 4,
    '2016-03-29': 4,
    '2016-04-23': 1,
    '2016-04-26': 2,
    '2016-04-27': 3,
    '2016-04-28': 4,
    '2016-04-29': 4,
    '2016-05-23': 1,
    '2016-05-26': 2,
    '2016-05-27': 3,
    '2016-05-28': 4,
    '2016-05-29': 4,
    '2016-06-23': 1,
    '2016-06-26': 2,
    '2016-06-27': 3,
    '2016-06-28': 4,
    '2016-06-29': 4,
    '2016-07-23': 1,
    '2016-07-26': 2,
    '2016-07-27': 3,
    '2016-07-28': 4,
    '2016-07-29': 4,
    '2016-08-23': 1,
    '2016-08-26': 2,
    '2016-08-27': 3,
    '2016-08-28': 4,
    '2016-08-29': 4,
    '2016-09-23': 1,
    '2016-09-26': 2,
    '2016-09-27': 3,
    '2016-09-28': 4,
    '2016-09-29': 4,
    '2016-10-23': 1,
    '2016-10-26': 2,
    '2016-10-27': 3,
    '2016-10-28': 4,
    '2016-10-29': 4,
    '2016-11-23': 1,
    '2016-11-26': 2,
    '2016-11-27': 3,
    '2016-11-28': 4,
    '2016-11-29': 4,
    '2016-12-23': 1,
    '2016-12-26': 2,
    '2016-12-27': 3,
    '2016-12-28': 4,
    '2016-12-29': 4,
};
let until = '2016-12-30';
let weekNames = ['一', '二', '三', '四', '五', '六', '日'];
let monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
];
let panelColors = ['#EEEEEE', '#F78A23', '#F87D09', '#AC5808', '#7B3F06'];

(Date.prototype as any).format = function(fmt: any) { 
    let o: any = { 
       'M+' : this.getMonth()+1,
       'd+' : this.getDate(),
       'h+' : this.getHours(),
       'm+' : this.getMinutes(),
       's+' : this.getSeconds(),
       'q+' : Math.floor((this.getMonth()+3)/3),
       'S'  : this.getMilliseconds()
   }; 
   if(/(y+)/.test(fmt)) {
           fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
    for(let k in o) {
       if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
   return fmt; 
}
const FunGetDateStr = (p_count: any, nowDate: any) => {
    let dd = nowDate;
    dd.setDate(dd.getDate() + p_count);//获取p_count天后的日期 
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1;//获取当前月份的日期 
    let d = dd.getDate();
    return y + "-" + m + "-" + d;
};
const getDateBetween = (start: any, end: any) => {
    var result = [];
    //使用传入参数的时间
    var startTime: any = new Date(start);
    var endTime: any = new Date(end);
    while (endTime - startTime >= 0) {
        let year = startTime.getFullYear();
        let month = startTime.getMonth();
        month = month<9?'0'+(month+1):month+1;
        let day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate();
        //加入数组
        result.push(year + "-" + month + "-" + day);
        //更新日期
        startTime.setDate(startTime.getDate() + 1);
    }
    return result;
};
class Dashboard extends React.Component {
    state = {
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        stu: [],
        selStu: '',
        pageNo: 1,
        baseInfo: {
            baseScore: '',
            endDescribe: '',
            reciteCount: '',
            studentName: ''
        },
        type: '1',
        centerData: {

        },
        mydate1: (new Date(FunGetDateStr(-5, new Date()) + " 00:00:00") as any).format('yyyy-MM-dd'),
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
        options: {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: ['你的评分', '同期最优评分', '同期差评分', '同期平均分'],
                left: 'left',
            },
            grid: {
                left: '0',
                right: '0',
                bottom: '0',
                containLabel: true,
            },
            toolbox: {
                feature: {
                    saveAsImage: {},
                },
            },
            xAxis: {
                type: 'category',
                data: ['2020/01', '2020/02', '2020/03', '2020/04', '2020/05', '2020/06'],
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    name: '你的评分',
                    type: 'line',
                    smooth: true,
                    data: [0, 0, 0, 0, 0, 0],
                },
                {
                    name: '同期最优评分',
                    type: 'line',
                    smooth: true,
                    data: [0, 0, 0, 0, 0, 0],
                },
                {
                    name: '同期差评分',
                    type: 'line',
                    smooth: true,
                    data: [0, 0, 0, 0, 0, 0],
                },
                {
                    name: '同期平均分',
                    type: 'line',
                    smooth: true,
                    lineStyle: {
                        type: 'dashed',
                    },
                    data: [0, 0, 0, 0, 0, 0],
                },
            ],
        },
        testInfo: {
            date: '',
            detail: [{
                word: '',
                state: ''
            }],
            passRate: 0,
            reciteCount: 0
        },
        sketchInfo: {
            prevReciteStatistics: [],
            reciteStatistics: [],
            nextReciteStatistics: [],
        
            // prevReciteStatistics: [0, 0, 0, 0, 0, 0, 12, 12, 12, 12, 36, 36, 24, 24, 0, 48, 12, 12, 36, 36, 0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0],
            // reciteStatistics: [0, 12, 24, 36, 48, 0, 12, 12, 12, 12, 36, 36, 24, 24, 0, 48, 12, 12, 36, 36, 0, 24, 24, 0, 48, 12, 12, 36, 36, 0, 24],
            // nextReciteStatistics: [36, 36, 36, 36, 36, 36, 36, 36, 36, 12, 36, 36, 24, 24, 36, 48, 12, 12, 36, 36, 48, 24, 24, 36, 36, 36, 36, 36, 36, 12, 12],
        },
        calendarSelectedMouth: moment().month(),
        calendarSelectedYear:  moment().year(),
        calendarSelectedDate:  moment(),
    };
    componentWillMount() {
        this.inited();
    }
    echartsReact = React.createRef();
    async inited() {
        let userid = await this.login();
        let {options, mydate1, mydate2, calendarSelectedMouth, calendarSelectedYear} = this.state;
        const pici = await this.getPici();
        const banji = await this.getClass(pici[0].batchId);
        const stu = await this.getStu(banji[0].classId);
        const baseInfo = await this.baseInfo(stu[0] ? stu[0].studentId : 0);
        const wrongInfo = await this.wrongBook({
            batchId: pici[0].batchId,
            classId: banji[0].classId,
            studentId: stu[0].studentId
        });
        let data1 = []
        let data2 = []
        if(wrongInfo.detail !== null) {
            data1 = wrongInfo.detail.slice(0, 10).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count
                }
            });
            data2 = wrongInfo.detail.slice(10, 20).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count
                }
            });
        }
        const centerData = await this.getChart({
            batchId: pici[0].batchId,
            classId: banji[0].classId,
            studentId: stu[0].studentId,
            startDate: mydate1,
            endDate: mydate2
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
            testDate: (new Date() as any).format('yyyy-MM-dd'),
        });
        testInfo.detail = testInfo.detail ? testInfo.detail : [{
            word: '暂无数据',
            state: '1'
        }]
        this.handleSketch(pici[0].batchId, banji[0].classId, stu[0].studentId, calendarSelectedMouth, calendarSelectedYear);
        this.setState({
            pici,
            banji,
            stu,
            selPici: pici[0].batchId,
            selBanji: banji[0].classId,
            selStu: stu[0].studentId,
            baseInfo,
            data1,
            data2,
            allCount: wrongInfo.totalPage,
            options,
            testInfo,
        });
        const instance = (this.echartsReact as any).getEchartsInstance();
        instance.setOption(options);
        console.log(userid);
    }
    async onDateChange(value: any) {
        const {selPici, selBanji, selStu} = this.state;
        console.log('onPanelChange')
        let testInfo = await this.getTest({
            batchId: selPici,
            classId: selBanji,
            studentId: selStu,
            testDate: moment(value).format('YYYY-MM-DD'),
        });
        testInfo.detail = testInfo.detail ? testInfo.detail : [{
            word: '暂无数据',
            state: '1'
        }]
        this.setState({
            testInfo,
            calendarSelectedDate: moment(value),
        })
    }
    tabCallback(key: any) {
        this.setState({
            type: key
        }, async () => {
            let {selPici, selBanji, selStu, options, mydate2, mydate1} = this.state;
            const centerData = await this.getChart({
                batchId: selPici,
                classId: selBanji,
                studentId: selStu,
                startDate: mydate1,
                endDate: mydate2
            });
            options.series[0].data = centerData.personal;
            options.series[1].data = centerData.best;
            options.series[2].data = centerData.worst;
            options.series[3].data = centerData.average;
            options.xAxis.data = getDateBetween(mydate1, mydate2);
            this.setState({
                options,
                mydate1,
                mydate2
            });
            const instance = (this.echartsReact as any).getEchartsInstance();
            instance.setOption(options);
        });
        console.log(key);
    }
    async nowPagChange(val: any) {
        let {selPici, selBanji, selStu} = this.state;
        const wrongInfo = await this.wrongBook({
            batchId: selPici,
            classId: selBanji,
            studentId: selStu
        });
        
        let data1 = []
        let data2 = []
        if(wrongInfo.detail !== null) {
            data1 = wrongInfo.detail.slice(0, 10).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count
                }
            });
            data2 = wrongInfo.detail.slice(10, 20).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count
                }
            });
        }
        this.setState({
            nowPag: val,
            data1,
            data2,
            allCount: wrongInfo.totalPage
        });
    }
    async dataChange(data: any) {
        let {selPici, selBanji, selStu, options, mydate2, mydate1} = this.state;
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
            startDate: mydate1,
            endDate: mydate2
        });
        options.series[0].data = centerData.personal;
        options.series[1].data = centerData.best;
        options.series[2].data = centerData.worst;
        options.series[3].data = centerData.average;
        options.xAxis.data = getDateBetween(mydate1, mydate2);
        this.setState({
            options,
            mydate1,
            mydate2
        });
        const instance = (this.echartsReact as any).getEchartsInstance();
        instance.setOption(options);
    }
    // async getTest(params: any) {
    //     let res = await get({url: baseUrl + `/dataCenter/testResult?batchId=${params.batchId}&classId=${params.classId}&studentId=${params.studentId}&date=${(new Date() as any).format('yyyy-MM-dd')}`});
    //     return res.data;
    // }
    async getTest(params: any) {
        let res = await get({url: baseUrl + `/dataCenter/testResult?batchId=${params.batchId}&classId=${params.classId}&studentId=${params.studentId}&date=${params.testDate}`});
        return res.data;
    }
    async getSketch(params: any) {
        let res = await get({url: baseUrl + `/dataCenter/studySketch?batchId=${params.batchId}&classId=${params.classId}&studentId=${params.studentId}&year=${params.calendarSelectedYear}&month=${params.calendarSelectedMouth + 1}`});
        console.log(res.data)
        return res.data;
    }
    async getChart(params: any) {
        const {type} = this.state;
        let res = await get({url: baseUrl + `/dataCenter/studyStatistics?batchId=${params.batchId}&classId=${params.classId}&studentId=${params.studentId}&type=${parseInt(type)}&startDate=${params.startDate}&endDate=${params.endDate}`});
        return res.data;
    }
    async wrongBook(params: any) {
        const {pageNo} = this.state;
        let res = await get({url: baseUrl + `/dataCenter/wrongBook?batchId=${params.batchId}&classId=${params.classId}&studentId=${params.studentId}&pageSize=20&pageNo=${pageNo}`});
        return res.data;
    }
    async baseInfo(stuid: string) {
        let res = await get({url: baseUrl + `/dataCenter/baseInfo?studentId=${stuid}`});
        return res.data;
    }
    async login() {
        let res = await post({
            url: baseUrl + '/auth/login',
            data: {
                userName: 'yooky',
                password: '123'
            }
        });
        return res;
    }
    async getPici() {
        let res = await get({url: baseUrl + '/manage/batch/list'});
        return res.data.detail || [];
    }
    async getClass(pici: any) {
        let res = await get({url: baseUrl + `/manage/class/list?batchId=${pici}&category=all`});
        console.log(res);
        return res.data.detail || [];
    }
    async getStu(banji: any) {
        const {selPici} = this.state;
        let res = await get({url: baseUrl + `/manage/student/list?batchId=${selPici}&classId=${banji}`});
        console.log(res);
        return res.data.detail || [];
    }
    async handlePiCi(val: any) {
        let res = await this.getClass(val);
        let res1 = await this.getStu(res[0] ? res[0].classId : 0);
        this.setState({
            selPici: val,
            banji: res,
            selBanji: res[0] ? res[0].classId : 0,
            stu: res1,
            selStu: res1[0] ? res1[0].classId : 0,
        });
        console.log(val);
    }
    async handleBanji(val: any) {
        let res = await this.getStu(val);
        this.setState({
            selBanji: val,
            stu: res,
            selStu: res[0] ? res[0].studentId : 0
        });
        console.log(val);
    }
    async handleSketch(batchId: any, classId: any, studentId: any, calendarSelectedMouth: any, calendarSelectedYear: any) {
        let prevCalendarSelectedMouth = calendarSelectedMouth - 1
        let prevCalendarSelectedYear = calendarSelectedYear

        let nextCalendarSelectedMouth = calendarSelectedMouth + 1
        let nextCalendarSelectedYear = calendarSelectedYear
        if (calendarSelectedMouth == 0) {
            prevCalendarSelectedMouth = 11
            prevCalendarSelectedYear = calendarSelectedYear - 1
        } else if (calendarSelectedMouth == 11) {
            nextCalendarSelectedMouth = 0
            nextCalendarSelectedYear = calendarSelectedYear + 1
        }
        let prevSketchItem = await this.getSketch({
            batchId,
            classId,
            studentId,
            calendarSelectedMouth: prevCalendarSelectedMouth, 
            calendarSelectedYear: prevCalendarSelectedYear,
        })
        let currentSketchItem = await this.getSketch({
            batchId,
            classId,
            studentId,
            calendarSelectedMouth, 
            calendarSelectedYear
        })
        let nextSketchItem = await this.getSketch({
            batchId,
            classId,
            studentId,
            calendarSelectedMouth: nextCalendarSelectedMouth, 
            calendarSelectedYear: nextCalendarSelectedYear,
        })
        let sketchInfo = {
            reciteStatistics: currentSketchItem.reciteStatistics,
            prevReciteStatistics: prevSketchItem.reciteStatistics,
            nextReciteStatistics: nextSketchItem.reciteStatistics,
        };
        console.log("calendarSelectedMouth", calendarSelectedMouth)
        this.setState({
            sketchInfo
        });
    }

    async handleStu(val: any) {
        let {selPici, selBanji, selStu, options, mydate2, mydate1, calendarSelectedMouth, calendarSelectedYear} = this.state;
        const baseInfo = await this.baseInfo(val);
        const wrongInfo = await this.wrongBook({
            batchId: selPici,
            classId: selBanji,
            studentId: val
        });
        let data1 = []
        let data2 = []
        if(wrongInfo.detail !== null) {
            data1 = wrongInfo.detail.slice(0, 10).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count
                }
            });
            data2 = wrongInfo.detail.slice(10, 20).map((val: any, index: number) => {
                return {
                    key: index + 1,
                    word: val.word,
                    count: val.count
                }
            });
        }
        const centerData = await this.getChart({
            batchId: selPici,
            classId: selBanji,
            studentId: val,
            startDate: mydate1,
            endDate: mydate2
        });
        options.series[0].data = centerData.personal;
        options.series[1].data = centerData.best;
        options.series[2].data = centerData.worst;
        options.series[3].data = centerData.average;
        options.xAxis.data = getDateBetween(mydate1, mydate2);
        let testInfo = await this.getTest({
            batchId: selPici,
            classId: selBanji,
            studentId: val,
            testDate: (new Date() as any).format('yyyy-MM-dd'),
        });
        testInfo.detail = testInfo.detail ? testInfo.detail : [{
            word: '暂无数据',
            state: '1'
        }]
        this.handleSketch(selPici, selBanji, val, moment().month(), moment().year());
        this.setState({
            selStu: val,
            baseInfo,
            data1,
            data2,
            options,
            testInfo,
            calendarSelectedMouth: moment().month(),
            calendarSelectedYear:  moment().year(),
            calendarSelectedDate: moment()
        });
        const instance = (this.echartsReact as any).getEchartsInstance();
        instance.setOption(options);
        console.log(val);
    }
    onCalendarGoPrev(value: any, onChange: any) {
        const {selPici, selBanji, selStu, sketchInfo} = this.state;
        const month = value.month();
        const year = value.year();
        const newValue = value.clone();
        if(month == 0) {
            newValue.year(year - 1);
            newValue.month(11);
        } else {
            newValue.month(month - 1);
        }
        let prevSketchInfo = {
            prevReciteStatistics: [],
            reciteStatistics: sketchInfo.prevReciteStatistics,
            nextReciteStatistics: sketchInfo.reciteStatistics
        }
        this.setState({
            calendarSelectedMouth: newValue.month(),
            calendarSelectedYear: newValue.year(),
            sketchInfo: prevSketchInfo
        })
        this.handleSketch(selPici, selBanji, selStu, newValue.month(), newValue.year());
        console.log('newValue', newValue.format('YYYY-MM-DD'))
        onChange(newValue);
    }

    onCalendarGoNext(value: any, onChange: any) {
        const {selPici, selBanji, selStu, sketchInfo} = this.state;
        const month = value.month();
        const year = value.year();
        const newValue = value.clone();
        if(month == 11) {
            newValue.year(year + 1);
            newValue.month(0);
        } else {
            newValue.month(month + 1);
        }
        let nextSketchInfo = {
            prevReciteStatistics: sketchInfo.reciteStatistics,
            reciteStatistics: sketchInfo.nextReciteStatistics,
            nextReciteStatistics: []
        }
        this.setState({
            calendarSelectedMouth: newValue.month(),
            calendarSelectedYear: newValue.year(),
            sketchInfo: nextSketchInfo
        })
        this.handleSketch(selPici, selBanji, selStu, newValue.month(), newValue.year());
        console.log('newValue', newValue.format('YYYY-MM-DD'))
        onChange(newValue);
    }

    render() {
        const { pici, selPici, banji, selBanji, stu, selStu, baseInfo, columns1, data1, columns2, data2, options, testInfo, nowPag, allCount, sketchInfo, calendarSelectedMouth, calendarSelectedYear, calendarSelectedDate} = this.state;
        return (
            <div className="gutter-example button-demo main-wrapper">
                {/* <BreadcrumbCustom /> */}
                <div className="mains">
                    <div className="fir">
                        数据中心
                    </div>
                    <div className="sec">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPici || (pici[0] && (pici[0] as any).describe) || "请选择"}
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
                            value={selBanji || (banji[0] && (banji[0] as any).describe) || "请选择"}
                            onChange={this.handleBanji.bind(this)}
                        >
                            {banji.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span">学员:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selStu || (stu[0] && (stu[0] as any).describe) || "请选择"}
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
                                <span className="num">{baseInfo.baseScore}</span>
                                <span className="word">分</span>
                            </div>
                            <div className="right">
                                <span className="label">累计背词：</span>
                                <span className="num">{baseInfo.reciteCount}</span>
                                <span className="word">词</span>
                            </div>
                        </div>
                        <div className="line-chart">
                            <Tabs defaultActiveKey="1" onChange={this.tabCallback.bind(this)}>
                                <TabPane tab="综合评分趋势" key="1" />
                                <TabPane tab="测试成绩" key="2" />
                                <TabPane tab="每日学习时长" key="3" />
                                <TabPane tab="每日背词数" key="4" />
                            </Tabs>
                            <div className="tab-content">
                                <div className="content">
                                    <span>时间：</span>
                                    <RangePicker
                                        defaultValue={[
                                            moment(new Date(FunGetDateStr(-5, new Date()) + " 00:00:00"), dateFormat),
                                            moment(new Date(), dateFormat),
                                        ]}
                                        onChange={this.dataChange.bind(this)}
                                        format={dateFormat}
                                    />
                                </div>
                                <ReactEcharts
                                    ref={e => {
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
                            <div className={data1.length ? "pag" : "display-none"}>
                                <Pagination defaultCurrent={1} defaultPageSize={20} current={nowPag} total={allCount} onChange={this.nowPagChange.bind(this)} />
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="distance-fir">
                            <div>
                                {baseInfo.endDescribe}
                            </div>
                        </div>
                        <div className="calendar-area">
                            <div>
                                <div className="site-calendar-demo-card">
                                    <Calendar fullscreen={false} 
                                    value={calendarSelectedDate}
                                    locale={locale}
                                    onChange={this.onDateChange.bind(this)}
                                    headerRender={({ value, type, onChange, onTypeChange }) => {
                                        const month = value.month();
                                        const year = value.year();
                                        return (
                                          <div className="custom-header">
                                            <div className="left-icon" onClick={this.onCalendarGoPrev.bind(this, value, onChange)}/>
                                            <div className="current-date-title">
                                                {`${String(year)}年  ${String(month + 1)}月`}
                                            </div>
                                            <div className="right-icon" onClick={this.onCalendarGoNext.bind(this, value, onChange)}/>
                                          </div>
                                        );
                                      }}
                                    dateFullCellRender={(value) => {
                                        let className = "date-level-0"
                                        let currentDayReciteStatistics = 0;
                                        if(moment(value).month() == calendarSelectedMouth) {
                                            currentDayReciteStatistics = sketchInfo.reciteStatistics[moment(value).date() - 1]
                                        } else if (moment(value).month() == calendarSelectedMouth - 1 || (moment(value).month() == 11 && calendarSelectedMouth == 0)) {
                                            currentDayReciteStatistics = sketchInfo.prevReciteStatistics[moment(value).date() - 1]
                                        } else if (moment(value).month() == calendarSelectedMouth + 1 || (moment(value).month() == 0 && calendarSelectedMouth == 11)) {
                                            currentDayReciteStatistics = sketchInfo.nextReciteStatistics[moment(value).date() - 1]
                                        }
                                        
                                        console.log('currentDayReciteStatistics' ,currentDayReciteStatistics)
                                        if(currentDayReciteStatistics == 0) {
                                            className = "date-level-0"
                                        } else if (currentDayReciteStatistics > 0 && currentDayReciteStatistics <= 12) {
                                            className = "date-level-1"
                                        } else if (currentDayReciteStatistics > 12 && currentDayReciteStatistics <= 24) {
                                            className = "date-level-2"
                                        } else if (currentDayReciteStatistics > 24 && currentDayReciteStatistics <= 36) {
                                            className = "date-level-3"
                                        } else if (currentDayReciteStatistics > 36) {
                                            className = "date-level-4"
                                        }
                                        let dateClassName = "date-level-area"
                                        if(moment(value).format('YYYY-MM-DD') == calendarSelectedDate.format('YYYY-MM-DD')) {
                                            dateClassName = "date-level-area-selection"
                                        } else if (moment(value).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                                            dateClassName = "date-level-area-today"
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
                                    <div className="list">
                                        {testInfo.detail.slice(0, 6).map((val, index) => {
                                            return (
                                                <div
                                                    className={val.state ? 'yes' : 'no'}
                                                    key={index}
                                                >
                                                    {index + 1}.{val.word}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="main">
                                        <span className="big">{testInfo.passRate}</span>
                                        <span className="small">%</span>
                                    </div>
                                    <div className="sub">当日测试通过率</div>
                                    <div className="list">
                                        {testInfo.detail.slice(6, 12).map((val, index) => {
                                            return (
                                                <div
                                                    className={val.state ? 'yes' : 'no'}
                                                    key={index}
                                                >
                                                    {index + 7}.{val.word}
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
