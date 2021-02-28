import React from 'react';
// import { Row, Col, Tabs, DatePicker, Table } from 'antd';
// import moment from 'moment';
import { PageHeader, Table, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/MainClass.less';

const routes = [
    {
        path: '/app/class/main',
        breadcrumbName: '班级和学员管理',
    },
    {
        path: '/class',
        breadcrumbName: '新建班级',
    },
];

class MainClass extends React.Component {
    state = {
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '学员姓名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '申请日期',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '联系方式',
                dataIndex: 'phone',
                key: 'phone',
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any, record: any) => (
                    <div className="control">
                        <div>拒绝加入</div>
                        <div>同意加入</div>
                    </div>
                ),
            },
        ],
        data1: [
            {
                key: '1',
                name: 'John Brown',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '2',
                name: 'Jim Green',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '3',
                name: 'Joe Black',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '4',
                name: 'John Brown',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '5',
                name: 'Jim Green',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
        ],
        columns2: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '学员姓名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '申请日期',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '联系方式',
                dataIndex: 'phone',
                key: 'phone',
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any, record: any) => (
                    <Popconfirm key={text.key} placement="top" title="您确定删除该学员么？" onConfirm={this.confirmDel.bind(this)} okText="确认" cancelText="取消">
                        <div className="control">
                            <div>删除</div>
                        </div>
                    </Popconfirm>
                ),
            },
        ],
        data2: [
            {
                key: '1',
                name: 'John Brown',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '2',
                name: 'Jim Green',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '3',
                name: 'Joe Black',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '4',
                name: 'John Brown',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
            {
                key: '5',
                name: 'Jim Green',
                createTime: '2017-10-31  23:12:00',
                phone: '1656656766',
                control: '',
            },
        ],
    };
    confirmDel(val: any) {
        console.log('删除', val);
    }

    render() {
        const { columns1, data1, columns2, data2 } = this.state;
        return (
            <div className="main-class">
                <div className="title-area">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="fir-line">
                        <div className="div">五期四班</div>
                        <Link className="div1" to={'/app/class/main/class/set'}>
                            设置学习任务
                        </Link>
                    </div>
                    <div className="sec-line">
                        <div className="left">
                            <div>班级人数:</div>
                            <div>35人</div>
                        </div>
                        <div className="left">
                            <div>班级码:</div>
                            <div>12345678</div>
                        </div>
                        <div className="right">新生申请</div>
                    </div>
                    <div className="thr-line">
                        <div className="left">
                            <div>班主任:</div>
                            <div>曲丽丽</div>
                        </div>
                        <div className="left">
                            <div>创建时间:</div>
                            <div>2017-01-10</div>
                        </div>
                        <div className="right">8人</div>
                    </div>
                </div>
                <div className="stu-oby">
                    <div className="title">
                        <div>新生申请</div>
                        <div>全部同意</div>
                        <div>全部拒绝</div>
                    </div>
                    <div className="aline" />
                    <div className="tell">
                        <Table
                            columns={columns1}
                            dataSource={data1}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                        />
                    </div>
                </div>
                <div className="stu-con">
                    <div className="title">
                        <div>学生管理</div>
                    </div>
                    <div className="aline" />
                    <div className="tell">
                        <Table
                            columns={columns2}
                            dataSource={data2}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default MainClass;
