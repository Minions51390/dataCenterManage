import React from 'react';
// import { Row, Col, Tabs, DatePicker, Table } from 'antd';
// import moment from 'moment';
import { PageHeader, Table, Popconfirm, message, Modal, Alert, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/MainClass.less';
import { post, get, patch, baseUrl } from '../../service/tools';

function GetRequest() {
    const url = `?${window.location.href.split('?')[1]}`; //获取url中"?"符后的字串
    let theRequest: any = {};
    if (url.indexOf('?') !== -1) {
        let str = url.substr(1);
        let strs = str.split('&');
        for (let i = 0; i < strs.length; i++) {
            theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
        }
    }
    return theRequest;
}

class MainClass extends React.Component {
    state = {
        routes: [
            {
                path: '/app/class/main',
                breadcrumbName: '班级和学员管理',
            },
            {
                path: '/class',
                breadcrumbName: `${sessionStorage.getItem('className') || '新建班级'}`,
            },
        ],
        classId: '',
        classInfo: {
            classCode: '',
            classId: '',
            className: '',
            classTeacher: '',
            createDate: '',
            studentCount: '',
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
                    <Popconfirm
                        key={text.key}
                        placement="top"
                        title="您确定删除该学员么？"
                        onConfirm={this.confirmDel.bind(this, text)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <div className="control">
                            <div>删除</div>
                        </div>
                    </Popconfirm>
                ),
            },
        ],
        data2: [],
        showModule: false,
        email: '',
        btnState: true,
        searchText: '',
    };
    componentWillMount() {
        this.initList();
    }
    async initList() {
        const classId = GetRequest()['classId'] || sessionStorage.getItem('classId');
        const piciId = GetRequest()['piciId'] || sessionStorage.getItem('piciId');
        if (classId) {
            sessionStorage.setItem('classId', classId as any);
        }
        if (piciId) {
            sessionStorage.setItem('piciId', piciId as any);
        }
        let res = await this.getClassInfo(classId);
        let data1 = res.data.apply.detail.map((item: any, index: any) => {
            return {
                key: index + 1,
                studentName: item.studentName,
                date: item.date,
                phoneNumber: item.phoneNumber,
                studentId: item.studentId,
                control: '',
            };
        });
        let data2 = res.data.studentInfo.detail.map((item: any, index: any) => {
            return {
                key: index + 1,
                studentName: item.studentName,
                date: item.date,
                phoneNumber: item.phoneNumber,
                studentId: item.studentId,
                control: '',
            };
        });
        this.setState({
            classId,
            classInfo: res.data.classInfo,
            data1,
            data2,
        });
    }
    async getClassInfo(id: any) {
        let res = await get({ url: baseUrl + `/api/v1/structure/class/info?classId=${id}` });
        return res;
    }

    rejectStu(studentId: any) {
        const { classId } = this.state;
        patch({
            url: baseUrl + '/api/v1/structure/apply',
            data: {
                studentId: studentId,
                opinion: 'reject',
                classId: +classId,
            },
        }).then((res) => {
            console.log(res);
            if (res.msg === '请设置班级任务后再进行此操作: ') {
                message.error({
                    content: '请设置班级任务后再进行此操作!!!',
                    className: 'custom-class',
                });
            }
            this.initList();
            setTimeout(() => {
                this.initList();
            }, 500);
        });
    }
    rejectAll() {
        const { data1 } = this.state;
        let stu = data1.map((val: any) => {
            return val.studentId;
        });
        this.rejectStu(stu);
    }
    resolveStu(studentId: any) {
        const { classId } = this.state;
        patch({
            url: baseUrl + '/api/v1/structure/apply',
            data: {
                studentId: studentId,
                opinion: 'agree',
                classId: +classId,
            },
        }).then((res) => {
            console.log(res);
            if (res.msg === '请设置班级任务后再进行此操作: ') {
                message.error({
                    content: '请设置班级任务后再进行此操作!!!',
                    className: 'custom-class',
                    style: {
                        marginTop: '20vh',
                    },
                });
            }
            this.initList();
            setTimeout(() => {
                this.initList();
            }, 500);
        });
    }
    resolveAll() {
        const { data1 } = this.state;
        let stu = data1.map((val: any) => {
            return val.studentId;
        });
        this.resolveStu(stu);
    }
    async delStu(stu: any) {
        let res = await post({ url: baseUrl + `/api/v1/structure/user/delete?studentId=${stu}` });
        return res;
    }
    async confirmDel(val: any) {
        console.log('删除', val);
        let res = await this.delStu(val.studentId);
        console.log(res);
        this.initList();
    }

    setShowModal() {
        this.setState({
            showModule: true,
        });
    }

    handleOk() {
        this.finClass();
        this.setState({
            showModule: false,
            btnState: true,
        });
    }

    handleCancel() {
        this.setState({
            showModule: false,
            btnState: true,
        });
    }

    getCode() {
        const { classId } = this.state;
        post({
            url: baseUrl + '/api/v1/structure/class/delete/email',
            data: {
                classId: +classId,
            },
        }).then((res) => {
            console.log(res);
            if (res.data) {
                this.setState({
                    email: res.data.email,
                    btnState: false,
                });
            }
        });
    }

    onInputChange = (e: any) => {
        console.log(e);
        this.setState({ searchText: e.target.value });
    };

    finClass() {
        const { classId, searchText } = this.state;
        post({
            url: baseUrl + '/api/v1/structure/class/delete',
            data: {
                classId: +classId,
                captcha: searchText,
            },
        }).then((res) => {
            console.log(res);
            window.history.back();
        });
    }

    render() {
        const {
            classId,
            classInfo,
            columns1,
            data1,
            columns2,
            data2,
            routes,
            showModule,
            email,
            btnState,
        } = this.state;
        return (
            <div className="main-class">
                <div className="title-area">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="fir-line">
                        <div className="div">{classInfo.className}</div>
                        <div className="div-w">
                            <div className="div-r" onClick={this.setShowModal.bind(this)}>
                                结课
                            </div>
                            <Link
                                className="div1"
                                to={`/app/class/main/class/set?classId=${classId}`}
                            >
                                设置学习任务
                            </Link>
                        </div>
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
                <Modal
                    closable={false}
                    visible={showModule}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    okText="确定"
                    cancelText="取消"
                >
                    <Alert
                        message="结课后该班级学员将无法继续使用本平台进行学习，且不能恢复，需谨慎操作。为此我们将通过您的邮箱进行验证。"
                        type="info"
                        showIcon
                    />
                    <div className="qrcode">
                        <div className="m-in">
                            <Input
                                size="large"
                                placeholder="请输入验证码"
                                prefix={<LockOutlined />}
                                value={this.state.searchText}
                                onChange={this.onInputChange}
                            />
                        </div>
                        {btnState ? (
                            <div className="m-btn" onClick={this.getCode.bind(this)}>
                                发送验证码到邮箱
                            </div>
                        ) : (
                            <div className="m-btn disable">已发送</div>
                        )}
                    </div>
                    <p className="m-text mar">
                        已向电子邮箱<span>{email}</span>发送验证码
                    </p>
                    <p className="m-text">请注意查收</p>
                </Modal>
            </div>
        );
    }
}

export default MainClass;
