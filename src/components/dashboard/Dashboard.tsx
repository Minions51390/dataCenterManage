import React from 'react';
import { Row, Col, Tabs, DatePicker, Table } from 'antd';
import moment from 'moment';
// import BreadcrumbCustom from '../widget/BreadcrumbCustom';
import EchartsViews from './EchartsViews';
// import EchartsProjects from './EchartsProjects';
// import b1 from '../../style/imgs/b1.png';
// import {
//     CloudOutlined,
//     HeartOutlined,
//     MailOutlined,
//     SyncOutlined,
//     SnippetsOutlined,
// } from '@ant-design/icons';
import Calendar from 'react-github-contribution-calendar';
import '../../style/pageStyle/Dashboard.less';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
// const { Column, ColumnGroup } = Table;
const dateFormat = 'YYYY/MM/DD';
var values = {
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
var until = '2016-12-30';
var weekNames = ['一', '二', '三', '四', '五', '六', '日'];
var monthNames = [
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
var panelColors = ['#EEEEEE', '#F78A23', '#F87D09', '#AC5808', '#7B3F06'];

class Dashboard extends React.Component {
    state = {
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '单词',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '错误次数',
                dataIndex: 'errorTime',
                key: 'errorTime',
            },
        ],
        data1: [
            {
                key: '1',
                name: 'John Brown',
                errorTime: 32,
            },
            {
                key: '2',
                name: 'Jim Green',
                errorTime: 42,
            },
            {
                key: '3',
                name: 'Joe Black',
                errorTime: 32,
            },
            {
                key: '4',
                name: 'John Brown',
                errorTime: 32,
            },
            {
                key: '5',
                name: 'Jim Green',
                errorTime: 42,
            },
            {
                key: '6',
                name: 'Joe Black',
                errorTime: 32,
            },
            {
                key: '7',
                name: 'John Brown',
                errorTime: 32,
            },
            {
                key: '8',
                name: 'Jim Green',
                errorTime: 42,
            },
            {
                key: '9',
                name: 'Joe Black',
                errorTime: 32,
            },
            {
                key: '10',
                name: 'Joe Black',
                errorTime: 32,
            },
        ],
        columns2: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '单词',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '错误次数',
                dataIndex: 'errorTime',
                key: 'errorTime',
            },
        ],
        data2: [
            {
                key: '1',
                name: 'John Brown',
                errorTime: 32,
            },
            {
                key: '2',
                name: 'Jim Green',
                errorTime: 42,
            },
            {
                key: '3',
                name: 'Joe Black',
                errorTime: 32,
            },
            {
                key: '4',
                name: 'John Brown',
                errorTime: 32,
            },
            {
                key: '5',
                name: 'Jim Green',
                errorTime: 42,
            },
            {
                key: '6',
                name: 'Joe Black',
                errorTime: 32,
            },
            {
                key: '7',
                name: 'John Brown',
                errorTime: 32,
            },
            {
                key: '8',
                name: 'Jim Green',
                errorTime: 42,
            },
            {
                key: '9',
                name: 'Joe Black',
                errorTime: 32,
            },
            {
                key: '10',
                name: 'Joe Black',
                errorTime: 32,
            },
        ],
        wordArr: [
            {
                word: 'apple',
                state: true,
            },
            {
                word: 'apple',
                state: false,
            },
            {
                word: 'apple',
                state: true,
            },
            {
                word: 'apple',
                state: true,
            },
            {
                word: 'apple',
                state: true,
            },
            {
                word: 'apple',
                state: false,
            },
            {
                word: 'apples',
                state: true,
            },
            {
                word: 'apples',
                state: true,
            },
            {
                word: 'apples',
                state: true,
            },
            {
                word: 'apple',
                state: true,
            },
            {
                word: 'apple',
                state: true,
            },
            {
                word: 'apple',
                state: false,
            },
        ],
    };
    tabCallback(key: any) {
        console.log(key);
    }
    render() {
        const { columns1, data1, columns2, data2, wordArr } = this.state;
        return (
            <div className="gutter-example button-demo main-wrapper">
                {/* <BreadcrumbCustom /> */}
                <Row gutter={[30, 0]}>
                    <Col span={16}>
                        <div className="score-word">
                            <div className="left">
                                <span className="label">综合评分：</span>
                                <span className="num">98</span>
                                <span className="word">分</span>
                            </div>
                            <div className="right">
                                <span className="label">累计背词：</span>
                                <span className="num">5000</span>
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
                                            moment('2015/01/01', dateFormat),
                                            moment('2015/01/01', dateFormat),
                                        ]}
                                        format={dateFormat}
                                    />
                                </div>
                                <EchartsViews />
                            </div>
                        </div>
                        <div className="error-title">错词本</div>
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
                    </Col>
                    <Col span={8}>
                        <div className="distance-fir">
                            <div>
                                距离考研还有<span>129</span>天
                            </div>
                        </div>
                        <div className="cal-area">
                            <div>
                                <Calendar
                                    values={values}
                                    until={until}
                                    weekNames={weekNames}
                                    monthNames={monthNames}
                                    panelColors={panelColors}
                                    dateFormat={'YYYY-MM-DD'}
                                />
                            </div>
                        </div>
                        <div className="word-area">
                            <div className="word-title">2021年1月31日</div>
                            <div className="word-content">
                                <div className="left">
                                    <div className="main">
                                        <span className="big">12</span>
                                        <span className="small">个</span>
                                    </div>
                                    <div className="sub">当日背词数</div>
                                    <div className="list">
                                        {wordArr.slice(0, 6).map((val, index) => {
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
                                        <span className="big">60</span>
                                        <span className="small">%</span>
                                    </div>
                                    <div className="sub">当日测试通过率</div>
                                    <div className="list">
                                        {wordArr.slice(6, 12).map((val, index) => {
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
