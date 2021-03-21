import React from 'react';
// import { Row, Col, Tabs, DatePicker, Table } from 'antd';
// import moment from 'moment';
import { PageHeader, Table, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/MainClass.less';
import { get } from '../../service/tools';
import axios from 'axios';

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
        classId: '',
        classInfo: {
            classCode: "",
            classId: "",
            className: "",
            classTeacher: "",
            createDate: "",
            studentCount: ""
        },
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '学员姓名',
                dataIndex: 'studentName',
                key: 'studentName',
            },
            {
                title: '申请日期',
                dataIndex: 'date',
                key: 'date',
            },
            {
                title: '联系方式',
                dataIndex: 'phoneNumber',
                key: 'phoneNumber',
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="control">
                        <div onClick={this.rejectStu.bind(this, [text.studentId])}>拒绝加入</div>
                        <div onClick={this.resolveStu.bind(this, [text.studentId])}>同意加入</div>
                    </div>
                ),
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
                title: '学员姓名',
                dataIndex: 'studentName',
                key: 'studentName',
            },
            {
                title: '申请日期',
                dataIndex: 'date',
                key: 'date',
            },
            {
                title: '联系方式',
                dataIndex: 'phoneNumber',
                key: 'phoneNumber',
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <Popconfirm key={text.key} placement="top" title="您确定删除该学员么？" onConfirm={this.confirmDel.bind(this, text)} okText="确认" cancelText="取消">
                        <div className="control">
                            <div>删除</div>
                        </div>
                    </Popconfirm>
                ),
            },
        ],
        data2: [],
    };
    componentWillMount() {
        this.initList();
    }
    async initList() {
        const classId = window.location.href.split('=')[1];
        let res = await this.getClassInfo(classId);
        let data1 = res.data.apply.detail.map((item: any, index: any) => {
            return {
                key: index + 1,
                studentName: item.studentName,
                date: item.date,
                phoneNumber: item.phoneNumber,
                studentId: item.studentId,
                control: ''
            }
        });
        let data2 = res.data.studentInfo.detail.map((item: any, index: any) => {
            return {
                key: index + 1,
                studentName: item.studentName,
                date: item.date,
                phoneNumber: item.phoneNumber,
                studentId: item.studentId,
                control: ''
            }
        });
        this.setState({
            classId,
            classInfo: res.data.classInfo,
            data1,
            data2
        });
    }
    async getClassInfo(id: any) {
        let res = await get({url: `/api/manage/class/info?classId=${id}`});
        return res;
    }
    rejectStu(studentId: any) {
        const {classId} = this.state;
        axios.patch('/api/manage/student/apply', {
            studentId: studentId,
            opinion: 'reject',
            classId: +classId
        }).then(res => {
            console.log(res)
        });
        this.initList();
    }
    rejectAll() {
        const {data1} = this.state;
        let stu = data1.map((val: any) => {
            return val.studentId;
        });
        this.rejectStu(stu);
    }
    resolveStu(studentId: any) {
        const {classId} = this.state;
        axios.patch('/api/manage/student/apply', {
            studentId: studentId,
            opinion: 'agree',
            classId: +classId
        }).then(res => {
            console.log(res)
        });
        this.initList();
    }
    resolveAll() {
        const {data1} = this.state;
        let stu = data1.map((val: any) => {
            return val.studentId;
        });
        this.resolveStu(stu);
    }
    async delStu(stu: any) {
        let res = await axios.delete(`/api/manage/student?studentId=${stu}`);
        return res;
    }
    async confirmDel(val: any) {
        console.log('删除', val);
        let res = await this.delStu(val.studentId);
        console.log(res);
        this.initList();
    }

    render() {
        const { classId, classInfo, columns1, data1, columns2, data2 } = this.state;
        return (
            <div className="main-class">
                <div className="title-area">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="fir-line">
                        <div className="div">{classInfo.className}</div>
                        <Link className="div1" to={`/app/class/main/class/set?classId=${classId}`}>
                            设置学习任务
                        </Link>
                    </div>
                    <div className="sec-line">
                        <div className="left">
                            <div>班级人数:</div>
                            <div>{classInfo.studentCount}</div>
                        </div>
                        <div className="left">
                            <div>班级码:</div>
                            <div>{classInfo.classCode}</div>
                        </div>
                        <div className="right">新生申请</div>
                    </div>
                    <div className="thr-line">
                        <div className="left">
                            <div>班主任:</div>
                            <div>{classInfo.classTeacher || '佚名'}</div>
                        </div>
                        <div className="left">
                            <div>创建时间:</div>
                            <div>{classInfo.createDate.split('T')[0]}</div>
                        </div>
                        <div className="right">{data1.length}</div>
                    </div>
                </div>
                <div className="stu-oby">
                    <div className="title">
                        <div>新生申请</div>
                        <div onClick={this.resolveAll.bind(this)}>全部同意</div>
                        <div onClick={this.rejectAll.bind(this)}>全部拒绝</div>
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
