import React from 'react';
import { Table, Pagination, Input, Button, Select, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/TestPaper.less';
import copy from 'clipboard-copy';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class TestPaper extends React.Component {
    state = {
        pageNo: 1,
        totalCount: 1,
        testQuery: '',
        testName: '',
        isVisible: false,
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
            },
            {
                title: '试卷名称',
                dataIndex: 'questionPaperName',
                key: 'questionPaperName',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
            },
            {
                title: '试卷ID',
                dataIndex: 'questionPaperId',
                key: 'questionPaperId',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                key: 'updateTime',
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="edit">
                        <div className="entry" onClick={this.handleEdit.bind(this, text)}>
                            编辑
                        </div>
                        <div className="copy" onClick={this.copyIdFn.bind(this, text.questionPaperId)}>
                            <div>复制ID</div>
                        </div>
                    </div>
                ),
            },
        ],
        data1: [],
        teacher: [],
        selTeacher: {
            teacherId: '',
            realName: '',
        }
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        this.setState({
            teacher,
            selTeacher,
        }, async () => {
            this.getTest();
        });
    }

    async getTest() {
        const { testQuery, pageNo, selTeacher } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-paper/list?teacherId=${selTeacher.teacherId}&query=${testQuery}&pageSize=20&pageNo=${pageNo}`,
        });
        const questionBankList = res?.data?.questionPaperList || [];
        const totalCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: questionBankList,
            totalCount,
        });
    }

    /** 获取教师列表 */
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list`});
        return res?.data??[];
    }

    handleTeacher(val: any){
        const { teacher } = this.state;
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === val
        });
        this.setState({
            selTeacher,
        }, async () => {
            this.getTest();
        });
    }

    /** 取消新建 */
    handleCreateCancel(val: any) {
        this.setState({
            isVisible: false,
        });
    }

    /** 展示创建弹窗 */
    showCreateModal() {
        this.setState({
            isVisible: true,
        });
    }

    /** 搜索 */
    onTestQueryChange(event: any) {
        this.setState({
            testQuery: event.target.value,
        });
    }

    /** 点击搜索按钮 */
    clickSearch() {
        this.setState(
            {
                pageNo: 1,
            },
            () => {
                this.getTest();
            }
        );
    }

    /** 试题名称 */
    onTestNameChange(event: any) {
        this.setState({
            testName: event.target.value,
        });
    }

    /** 确认新建 */
    async handleCreateOk(val: any) {
        const { testName } = this.state;
        this.setState({
            isVisible: false,
        });
        const testID = await this.confimeNew();
        sessionStorage.setItem('testDetailId', testID);
        sessionStorage.setItem('testDetailName', testName);
        window.location.href = `${window.location.pathname}#/app/test/testPaper/testDetail`;
    }

    /** 编辑按钮 */
    async handleEdit(val: any) {
        console.log(val);
        sessionStorage.setItem('testDetailId', val.questionPaperId);
        sessionStorage.setItem('testDetailName', val.questionPaperName);
        window.location.href = `${window.location.pathname}#/app/test/testPaper/testDetail`;
    }

    /** 确认新建接口 */
    async confimeNew() {
        const { testName } = this.state;
        const response: any = await post({
            url: baseUrl + '/api/v1/question-paper/',
            data: {
                questionPaperName: testName,
            },
        });
        console.log(response);
        return response?.data?.questionPaperId || '1';
    }

    /** 更换页面 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
            }
        );
    }

    /** 复制函数 */
    copyIdFn(id: any) {
        copy(id)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }

    render() {
        const { columns1, data1, pageNo, totalCount, testQuery, testName, isVisible, teacher, selTeacher } = this.state;
        return (
            <div className="paper-wrapper">
                <div className="header">
                    <div className="fir">试卷管理</div>
                    <div className="sec">试卷列表</div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>
                            搜索试卷:
                            <Input
                                className="gap-12"
                                style={{ width: 272 }}
                                placeholder="请输入关键词"
                                value={testQuery}
                                onChange={this.onTestQueryChange.bind(this)}
                            />
                            <Button
                                className="gap-48"
                                type="primary"
                                onClick={this.clickSearch.bind(this)}
                            >
                                查询
                            </Button>
                        </div>
                        <div onClick={this.showCreateModal.bind(this)}>
                            <Button type="primary" icon={<PlusOutlined />}>
                                新建
                            </Button>
                        </div>
                    </div>
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
                    </div>
                    <div className="thr">
                        <Table
                            columns={columns1}
                            dataSource={data1}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                        />
                    </div>
                    <div className={data1.length ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            pageSize={20}
                            current={pageNo}
                            total={totalCount * 20}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    title="新建试卷"
                    visible={isVisible}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="module-area">
                        试卷名称:
                        <Input
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请输入试卷名称"
                            value={testName}
                            onChange={this.onTestNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default TestPaper;
