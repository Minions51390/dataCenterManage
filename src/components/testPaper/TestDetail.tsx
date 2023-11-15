import React from 'react';
import { Table, Pagination, Input, Button, PageHeader, message, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import copy from 'clipboard-copy';
import '../../style/pageStyle/TestDetail.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class TestDetail extends React.Component {
    state = {
        routes: [
            {
                path: '/app/test/testPaper',
                breadcrumbName: '试卷管理',
            },
            {
                path: '/testDetail',
                breadcrumbName: `${sessionStorage.getItem('testDetailName') || '新建'}试卷`,
            },
        ],
        testQuery: '',
        pageNo: 1,
        allCount: 1,
        isVisible: false,
        /** 默认数据 */
        testPaperID: sessionStorage.getItem('testDetailId') || '',
        testPaperName: sessionStorage.getItem('testDetailName') || '',
        creator: '',
        createTime: '0000-00-00 00:00:00',
        updateTime: '0000-00-00 00:00:00',
        questionCount: '120',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '试题内容',
                key: 'testName',
                render: (text: any) => (
                    <div className="title">
                        <div className="que">{text.stem}</div>
                        <div className="choose">
                            <div className="tr">
                                <div>
                                    {text.options[0].key}.{text.options[0].value}
                                </div>
                                <div>
                                    {text.options[1].key}.{text.options[1].value}
                                </div>
                            </div>
                            <div className="tr">
                                <div>
                                    {text.options[2].key}.{text.options[2].value}
                                </div>
                                {text.options[3] ? (
                                    <div>
                                        {text.options[3].key}.{text.options[3].value}
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                        <div className="right">正确答案：{text.rightKey}</div>
                    </div>
                ),
            },
        ],
        data1: [],
        selectedRowKeys: [],
        selectedRows: [],
        bankPeople: '',
        bankPeopleList: [
            {
                realName: '全部',
                teacherId: 0,
            },
        ],
        bank: '',
        setName: '全部',
        bankList: [
            {
                setName: '全部',
                bankID: 0,
            },
        ],
        pageNom: 1,
        allCountm: 1,
        paperData: [],
        moduleType: 'select',
        selectedRowKeysM: [],
        testQueryM: '',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const testData = await this.getTestData();
        this.setState({ ...testData });
        this.getTestList();
        this.getAllTeacher();
    }

    /** 单个试卷信息 */
    async getTestData() {
        const { testPaperID } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-paper/?questionPaperId=${testPaperID}`,
        });
        console.log(res);
        return {
            testPaperID: res?.data?.questionPaperId,
            creator: res?.data?.creator,
            createTime: res?.data?.createTime,
            updateTime: res?.data?.updateTime,
            questionCount: res?.data?.questionCount,
        };
    }

    /** 试卷试题列表 */
    async getTestList() {
        const { testPaperID, testQuery, pageNo } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-paper/question/list?questionPaperId=${testPaperID}&query=${testQuery}&pageSize=20&pageNo=${pageNo}`,
        });
        let testList = res?.data?.questionList || [];
        testList.forEach((val: any, index: any) => {
            val.key = index + 1;
        });
        const allCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: testList,
            allCount,
        });
    }

    /** 获取全部教师接口 */
    async getAllTeacher() {
        const res: any = await get({
            url: `${baseUrl}/api/v1/structure/teacher/list`,
        });
        this.setState(
            {
                bankPeopleList: res?.data || [],
            },
            () => {
                this.getQuestionBankList();
            }
        );
        console.log(res);
    }

    /** 获取所有题库列表 */
    async getQuestionBankList() {
        const { bankPeople } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-set/list?query=&teacherId=${bankPeople}&sortKey=createTime&sortOrder=asc&pageSize=20&pageNo=1&all=on`,
        });
        console.log('------------->', res);
        const questionBankList = res?.data?.questionSetList || [];
        this.setState({
            bankList: questionBankList,
        });
    }

    /** 题库试题列表 */
    async getQuestionList() {
        console.log('getQuestionList');
        const { bank, testQueryM, pageNom } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-set/question/list?setId=${bank}&query=${testQueryM}&pageSize=1000&pageNo=${pageNom}`,
        });
        let questionBankList = res?.data?.questionList || [];
        questionBankList.forEach((val: any, index: any) => {
            val.key = index + 1;
        });
        const allCountm = (res?.data?.totalCount || 0) / 20;
        this.setState({
            paperData: questionBankList,
            allCountm,
        });
    }

    /** 批量导入接口 */
    async addQuestion() {
        const { testPaperID, selectedRowKeysM } = this.state;
        console.log('selectedRowKeysM', selectedRowKeysM);
        const questionIdList = selectedRowKeysM.map((val: any) => {
            return val.questionId;
        });
        const res = await post({
            url: baseUrl + '/api/v1/question-paper/question',
            data: {
                questionPaperId: testPaperID,
                selectAll: false,
                questionIdList,
            },
        });
        this.getTestList();
        const testData = await this.getTestData();
        this.setState({ ...testData, selectedRowKeysM: [] });
        message.success('导入成功');
        console.log(res);
    }

    /** 批量删除 */
    async delQuestion() {
        const { testPaperID, selectedRows } = this.state;
        const questionIdList = selectedRows.map((val: any) => {
            return val.questionId;
        });
        const res = await post({
            url: baseUrl + '/api/v1/question-paper/question/delete',
            data: {
                questionPaperId: testPaperID,
                questionIdList,
                selectAll: false,
            },
        });
        this.getTestList();
        const testData = await this.getTestData();
        this.setState({ ...testData, selectedRowKeys: [], selectedRows: [] });
        console.log(res);
    }

    /** 弹窗内的搜索 */
    ontestQueryChangeM(event: any) {
        this.setState({
            testQueryM: event.target.value,
        });
    }

    /** 外部搜索 */
    ontestQueryChange(event: any) {
        this.setState({
            testQuery: event.target.value,
        });
    }

    /** 更换页码 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
                this.getTestList();
            }
        );
    }

    /** 弹窗内搜索接口 */
    searchQuery(val: any) {
        this.setState(
            {
                pageNo: 1,
            },
            () => {
                this.getTestList();
            }
        );
    }

    /** 外部搜索接口 */
    searchQueryM(val: any) {
        this.setState(
            {
                pageNom: 1,
            },
            () => {
                this.getQuestionList();
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

    /** 选择新的可选项 */
    onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows);
        this.setState({ selectedRowKeys, selectedRows });
    };

    onSelectChangeM = (selectedRowKeysM: any, selectedRows: any) => {
        console.log('selectedRowKeys changed: ', selectedRowKeysM, selectedRows);
        this.setState({ selectedRowKeysM: selectedRows });
    };

    /** 批量删除 */
    async delArr() {
        const { selectedRows } = this.state;
        if (selectedRows.length > 0) {
            /** 调用删除接口 */
            Modal.confirm({
                title: '是否确认删除试题？',
                cancelText: '取消',
                okText: '确定',
                onOk: this.delQuestion.bind(this),
            });
        }
    }

    /** 展示创建弹窗 */
    showCreateModal() {
        this.setState({
            isVisible: true,
        });
    }

    /** 确认新建 */
    async handleCreateOk(val: any) {
        const paperData = await this.getPaper();
        this.setState({
            paperData,
        });
    }

    handleCreateCancel(val: any) {
        this.setState({
            isVisible: false,
        });
    }

    async getPaper() {
        return [];
    }

    handlePeopleType(val: any) {
        this.setState(
            {
                bankPeople: val,
            },
            () => {
                this.getQuestionBankList();
            }
        );
    }

    handleBank(val: any, option: any) {
        this.setState(
            {
                bank: val,
                setName: option.children,
            },
            () => {
                this.getQuestionList();
            }
        );
    }

    handleSelModule() {
        this.setState({
            moduleType: 'select',
        });
    }

    handleListModule() {
        this.setState({
            moduleType: 'list',
        });
    }

    /** 更换页码 */
    nowPagChangeM(val: any) {
        this.setState(
            {
                pageNom: val,
            },
            async () => {
                /** 更新数据 */
                this.getQuestionList();
            }
        );
    }

    confirmImport() {
        this.setState({
            pageNo: 1,
            pageNom: 1,
            isVisible: false,
            moduleType: 'select',
        });
        this.addQuestion();
    }

    render() {
        const {
            testPaperID,
            testPaperName,
            testQuery,
            routes,
            columns1,
            data1,
            selectedRowKeys,
            selectedRowKeysM,
            allCount,
            pageNo,
            creator,
            createTime,
            updateTime,
            questionCount,
            isVisible,
            bankPeople,
            bankPeopleList,
            bank,
            bankList,
            setName,
            moduleType,
            pageNom,
            allCountm,
            paperData,
            testQueryM,
        } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const rowSelectionM = {
            selectedRowKeysM,
            onChange: this.onSelectChangeM,
        };
        return (
            <div className="test-detail-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{testPaperName}</div>
                        <Button onClick={this.copyIdFn.bind(this, testPaperID)}>复制试卷ID</Button>
                    </div>
                    <div className="thr">
                        <div className="tr">
                            <div>
                                创建人：<span>{creator}</span>
                            </div>
                            <div>
                                创建时间：<span>{createTime}</span>
                            </div>
                            <div className="sp">试卷题数</div>
                        </div>
                        <div className="tr">
                            <div>
                                试卷ID：<span>{testPaperID}</span>
                            </div>
                            <div>
                                更新时间：<span>{updateTime}</span>
                            </div>
                            <div className="hard">{questionCount}个</div>
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>试题列表:</div>
                        <div className="right">
                            <Input
                                className="gap-12"
                                style={{ width: 272 }}
                                placeholder="请输入关键词"
                                value={testQuery}
                                onChange={this.ontestQueryChange.bind(this)}
                            />
                            <Button
                                className="gap-12"
                                type="primary"
                                onClick={this.searchQuery.bind(this)}
                            >
                                查询
                            </Button>
                            <div className="gap-40">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={this.showCreateModal.bind(this)}
                                >
                                    导入
                                </Button>
                                <Button onClick={this.delArr.bind(this)}>批量删除</Button>
                            </div>
                        </div>
                    </div>
                    <div className="thr">
                        <Table
                            rowSelection={rowSelection}
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
                            total={allCount * 20}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    title="导入试题"
                    visible={isVisible}
                    footer={null}
                    width={800}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    {moduleType === 'select' ? (
                        <div>
                            <div className="module-area">
                                选择题库创建人:
                                <Select
                                    defaultValue={bankPeople}
                                    className="gap-8"
                                    style={{ width: 294 }}
                                    placeholder="选择题库创建人"
                                    onChange={this.handlePeopleType.bind(this)}
                                    value={bankPeople}
                                >
                                    {bankPeopleList.map((item: any, index: number) => (
                                        <Option key={index} value={item.teacherId}>
                                            {item.realName}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="module-area" style={{ paddingLeft: 41 }}>
                                选择题库:
                                <Select
                                    defaultValue={bank}
                                    className="gap-8"
                                    style={{ width: 294 }}
                                    placeholder="选择题库"
                                    onChange={this.handleBank.bind(this)}
                                    value={bank}
                                >
                                    {bankList.map((item: any, index: number) => (
                                        <Option key={index} value={item.setId}>
                                            {item.setName}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="module-area btnw">
                                <Button
                                    block
                                    type="primary"
                                    onClick={this.handleListModule.bind(this)}
                                >
                                    确认
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="details-m">
                            <div className="fir">
                                <div>{setName}</div>
                                <div className="right">
                                    <Input
                                        className="gap-12"
                                        style={{ width: 272 }}
                                        placeholder="请输入关键词"
                                        value={testQueryM}
                                        onChange={this.ontestQueryChangeM.bind(this)}
                                    />
                                    <Button
                                        className="gap-12"
                                        type="primary"
                                        onClick={this.searchQueryM.bind(this)}
                                    >
                                        查询
                                    </Button>
                                </div>
                            </div>
                            <div className="thr">
                                <Table
                                    rowSelection={rowSelectionM}
                                    columns={columns1}
                                    dataSource={paperData}
                                    pagination={false}
                                    size={'middle'}
                                    bordered={false}
                                />
                            </div>
                            <div className={paperData.length ? 'pag' : 'display-none'}>
                                <Pagination
                                    defaultCurrent={1}
                                    pageSize={1000}
                                    current={pageNom}
                                    total={allCountm * 20}
                                    onChange={this.nowPagChangeM.bind(this)}
                                />
                            </div>
                            <div className="fir mt-20">
                                <div>
                                    <Button
                                        type="primary"
                                        onClick={this.handleSelModule.bind(this)}
                                    >
                                        返回上一步
                                    </Button>
                                </div>
                                <div className="right">
                                    <Button type="primary" onClick={this.confirmImport.bind(this)}>
                                        确认导入
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        );
    }
}

export default TestDetail;
