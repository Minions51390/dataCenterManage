import React from 'react';
import { Table, Pagination, Input, Button, PageHeader, message, Modal, Select, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PreviewAll from '../preview/all';
import copy from 'clipboard-copy';
import '../../style/pageStyle/TestDetail.less';
import { get, post, baseUrl } from '../../service/tools';

const { Option } = Select;

const BANK_TYPE_MAP: any = {
    choice: '单选',
    pack: '词汇理解',
    long_reading: '长篇阅读',
    cf_reading: '仔细阅读',
};

const SELECT_TP: any = {
    cet4: '四级',
    cet6: '六级',
};

const SELECT_TP_LIST = ['', 'cet4', 'cet6'];

let YEAR_MAP = new Array(new Date().getFullYear() - 1950).fill(0).map((item, index) => {
    return `${index + 1951}`;
});

YEAR_MAP.push('');

YEAR_MAP = YEAR_MAP.reverse();

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
        setType: 'choice',
        setTypeList: ['choice', 'pack', 'long_reading', 'cf_reading'],
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
        previewVisible: false,
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => (
                    <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>
                ),
            },
            {
                title: '试题类型',
                key: 'key',
                render: (text: any, record: any, index: number) => (
                    <div>{BANK_TYPE_MAP[text.setType]}</div>
                ),
            },
            {
                title: '试题内容',
                key: 'setName',
                render: (text: any, record: any, index: number) => (
                    <div>
                        {text.setType === 'choice'
                            ? this.renderChoice(text)
                            : text.setType === 'pack'
                            ? this.renderPack(text)
                            : text.setType === 'long_reading'
                            ? this.renderLong(text)
                            : this.renderCf(text)}
                    </div>
                ),
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any, record: any, index: number) => (
                    <div
                        onClick={this.delOneQuestion.bind(this, text, index)}
                        style={{ cursor: 'pointer' }}
                    >
                        删除
                    </div>
                ),
            },
        ],
        columnsModel: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => (
                    <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>
                ),
            },
            {
                title: '真题年份',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>-</div>,
            },
            {
                title: '真题类型',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>-</div>,
            },
            {
                title: '试题内容',
                key: 'setName',
                render: (text: any, record: any, index: number) => (
                    <div>
                        {text.setType === 'choice'
                            ? this.renderChoice(text)
                            : text.setType === 'pack'
                            ? this.renderPack(text)
                            : text.setType === 'long_reading'
                            ? this.renderLong(text)
                            : this.renderCf(text)}
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
        selectedRowKeysK: [],
        testQueryM: '',
        selectYear: '',
        selectTp: '',
        parts: [
            {
                partDesc: '',
                partName: 'Part 1',
                selectedRowKeys: [],
                selectedRows: [],
                questionList: [],
            },
        ],
        partsIndex: 0,
    };

    componentWillMount() {
        this.inited();
    }

    onPartsDescChange(val: any, index: number, event: any) {
        const { parts } = this.state;
        const valData = event.target.value;
        parts[index].partDesc = valData;
        this.setState({
            parts,
        });
    }

    addPart() {
        const { parts } = this.state;
        this.setState({
            parts: [
                ...parts,
                {
                    partDesc: '',
                    partName: `Part ${parts.length + 1}`,
                    selectedRowKeys: [],
                    selectedRows: [],
                    questionList: [],
                },
            ],
        });
    }

    delPart(index: number) {
        const { parts } = this.state;
        parts.splice(index, 1);
        this.setState({
            parts,
        });
    }

    /** 仔细阅读 */
    renderCf(text: any) {
        return (
            <div className="titles">
                <div className="name">{text.title}</div>
                <div className="stem">{text.stem}</div>
            </div>
        );
    }

    /** 词汇理解 */
    renderPack(text: any) {
        return (
            <div className="titles">
                <div className="name">{text.title}</div>
                <div className="stem">{text.stem}</div>
            </div>
        );
    }

    /** 长篇阅读 */
    renderLong(text: any) {
        return (
            <div className="titles">
                <div className="name">{text.title}</div>
                <div className="stem">{text.topic}</div>
            </div>
        );
    }

    /** 单选 */
    renderChoice(text: any) {
        return (
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
        );
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
        const parts = res.data.map((item: any, index: number) => {
            return {
                ...item,
                questionList: item.questionList.map((val: any, key: number) => {
                    return {
                        ...val,
                        partsIndex: index,
                        key,
                    };
                }),
                selectedRowKeys: [],
                selectedRows: [],
            };
        });
        const allCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            parts,
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
        const { bankPeople, setType } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-set/list?query=&teacherId=${bankPeople}&setType=${setType}&sortKey=createTime&sortOrder=asc&pageSize=20&pageNo=1&all=on`,
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
        const { bank, testQueryM, pageNom, selectYear, selectTp } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-set/question/list?setId=${bank}&query=${testQueryM}${
                selectYear ? '&year=' + selectYear + '' : ''
            }${selectTp ? '&tp=' + selectTp + '' : ''}&pageSize=100000&pageNo=${pageNom}`,
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
        const { testPaperID, parts } = this.state;
        const myPart = parts.map((item) => {
            return {
                partDesc: item.partDesc,
                partName: item.partName,
                questionList: item.questionList.map((val: any) => {
                    return {
                        setId: val.setId,
                        questionId: val.questionId,
                        setType: val.setType,
                    };
                }),
            };
        });

        const res = await post({
            url: baseUrl + '/api/v1/question-paper/question',
            data: {
                questionPaperId: testPaperID,
                parts: myPart,
            },
        });
        this.getTestList();
        const testData = await this.getTestData();
        console.log(123123, testData);
        this.setState({ ...testData, selectedRowKeysM: [] });
        message.success('导入成功');
    }

    /** 外层删除一个 */
    delOneQuestion(text: any, index: number) {
        const { parts } = this.state;
        console.log(123123123, text, index, text.partsIndex);
        parts[text.partsIndex].questionList.splice(index, 1);
        this.setState({
            parts: JSON.parse(JSON.stringify(parts)),
        });
    }

    /** 外层批量删除 */
    delMulQuestion(index: number) {
        const { parts } = this.state;
        const { selectedRowKeys, questionList } = parts[index];
        selectedRowKeys.map((key) => {
            (questionList as any)[key] = false;
            return key;
        });

        let newQuestion = questionList.filter(Boolean);

        newQuestion.forEach((item: any, index) => {
            item.key = index;
        });

        parts[index].questionList = newQuestion;
        parts[index].selectedRowKeys = [];
        parts[index].selectedRows = [];

        this.setState({
            parts: JSON.parse(JSON.stringify(parts)),
        });
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

    onSelectChange = (index: any, selectedRowKeys: any, selectedRows: any) => {
        console.log('selectedRowKeys changed: ', index, selectedRowKeys, selectedRows);
        const { parts } = this.state;
        parts[index].selectedRowKeys = selectedRowKeys;
        parts[index].selectedRows = selectedRows;
        this.setState({
            parts,
        });
    };

    onSelectChangeM = (selectedRowKeysM: any, selectedRows: any) => {
        console.log('selectedRowKeys changed: ', selectedRowKeysM, selectedRows);
        this.setState({ selectedRowKeysM: selectedRows, selectedRowKeysK: selectedRowKeysM });
    };

    /** 展示创建弹窗 */
    showCreateModal(index: number) {
        this.setState({
            isVisible: true,
            partsIndex: index,
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

    handlePreviewCancel(val: any) {
        this.setState({
            previewVisible: false,
        });
    }

    handleShowPreview() {
        this.setState({
            previewVisible: true,
        });
    }

    async getPaper() {
        return [];
    }

    /** 题库题型 */
    handleSetType(val: any) {
        this.setState(
            {
                setType: val,
            },
            () => {
                this.getQuestionBankList();
            }
        );
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
            selectedRowKeysM: [],
            selectedRowKeysK: [],
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
        let { parts, partsIndex, selectedRowKeysM } = this.state;
        const rowList = selectedRowKeysM.map((item: any, index: number) => {
            return {
                ...item,
                partsIndex,
                key: parts[partsIndex].questionList.length + index,
            };
        });
        parts[partsIndex].questionList = [...parts[partsIndex].questionList, ...rowList] as any;
        this.setState({
            pageNo: 1,
            pageNom: 1,
            isVisible: false,
            moduleType: 'select',
            selectedRowKeysM: [],
            selectedRowKeysK: [],
            parts,
        });
    }

    tagClose = (e: any, index: number) => {
        console.log(9090909090, e, index);
        const arrM = this.state.selectedRowKeysM.filter((item: any) => {
            return item.questionId !== e.questionId;
        });
        const arrK = this.state.selectedRowKeysM.filter((item: any) => {
            return item.questionId !== index;
        });
        this.setState({ selectedRowKeysM: arrM, selectedRowKeysK: arrK });
    };

    handleSelectTp(val: any) {
        this.setState(
            {
                selectTp: val,
            },
            () => {
                this.getQuestionList();
            }
        );
    }

    handleSelectYear(val: any) {
        this.setState(
            {
                selectYear: val,
            },
            () => {
                this.getQuestionList();
            }
        );
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
            selectedRowKeysK,
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
            setType,
            setTypeList,
            columnsModel,
            selectYear,
            selectTp,
            parts,
            previewVisible,
        } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        const rowSelectionM = {
            selectedRowKeys: selectedRowKeysK,
            selectedRowKeysM,
            onChange: this.onSelectChangeM,
        };

        return (
            <div className="test-detail-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{testPaperName}</div>
                        <div>
                            <Button onClick={this.copyIdFn.bind(this, testPaperID)}>
                                复制试卷ID
                            </Button>
                            <Button type="primary" onClick={this.addQuestion.bind(this)}>
                                <span style={{ color: '#fff' }}>保存</span>
                            </Button>
                        </div>
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
                        <div className="left">
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
                            </div>
                        </div>
                        <div className="right">
                            <Button onClick={this.handleShowPreview.bind(this)}>预览试卷</Button>
                        </div>
                    </div>
                    <div className="thr">
                        {parts.map((item, index) => {
                            return (
                                <div>
                                    <div className="thrHeader">
                                        <div className="name">
                                            {item.partName}
                                            <Input
                                                className="gap12"
                                                style={{ width: 240 }}
                                                placeholder="请输入该模块名称"
                                                value={item.partDesc}
                                                onChange={this.onPartsDescChange.bind(
                                                    this,
                                                    item,
                                                    index
                                                )}
                                            />
                                        </div>
                                        <div className="control">
                                            <Button onClick={this.delMulQuestion.bind(this, index)}>
                                                批量删除
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={this.showCreateModal.bind(this, index)}
                                            >
                                                导入
                                            </Button>
                                            <Button onClick={this.delPart.bind(this, index)}>
                                                删除模块
                                            </Button>
                                        </div>
                                    </div>
                                    <Table
                                        rowSelection={{
                                            selectedRowKeys: item.selectedRowKeys,
                                            onChange: this.onSelectChange.bind(this, index),
                                        }}
                                        columns={columns1}
                                        dataSource={item.questionList}
                                        pagination={false}
                                        size={'middle'}
                                        bordered={false}
                                    />
                                </div>
                            );
                        })}
                        <div className="add" onClick={this.addPart.bind(this)}>
                            <Button style={{ width: '100%' }} type="dashed" icon={<PlusOutlined />}>
                                添加新的Part
                            </Button>
                        </div>
                    </div>
                </div>
                <Modal
                    title="预览试卷"
                    visible={previewVisible}
                    footer={null}
                    width={900}
                    bodyStyle={{ height: '740px', overflow: 'auto' }}
                    onCancel={this.handlePreviewCancel.bind(this)}
                >
                    <div>
                        <PreviewAll testPaperID={testPaperID} />
                    </div>
                </Modal>
                <Modal
                    title="导入试题"
                    visible={isVisible}
                    footer={null}
                    width={900}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    {moduleType === 'select' ? (
                        <div>
                            <div className="module-area" style={{ paddingLeft: 41 }}>
                                题库题型:
                                <Select
                                    defaultValue={setType}
                                    className="gap-8"
                                    style={{ width: 294 }}
                                    placeholder="请选择学员批次"
                                    onChange={this.handleSetType.bind(this)}
                                    value={setType}
                                >
                                    {setTypeList.map((item: any, index: number) => (
                                        <Option key={index} value={item}>
                                            {BANK_TYPE_MAP[item] || '未知'}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
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
                                <div className="left">
                                    <div style={{ fontWeight: 500 }}>{setName}题库</div>
                                    <div className="right">
                                        <Input
                                            className="gap-12"
                                            style={{ width: 172 }}
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
                                <div className="right">
                                    <div className="gap-12">
                                        年份:
                                        <Select
                                            defaultValue={selectYear}
                                            className="gap-12"
                                            style={{ width: 124 }}
                                            placeholder="请选择学员批次"
                                            onChange={this.handleSelectYear.bind(this)}
                                            value={selectYear}
                                        >
                                            {YEAR_MAP.map((item: any, index: number) => (
                                                <Option key={index} value={item}>
                                                    {item || '不限'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="gap-12">
                                        类型:
                                        <Select
                                            defaultValue={selectTp}
                                            className="gap-12"
                                            style={{ width: 124 }}
                                            placeholder="类型"
                                            onChange={this.handleSelectTp.bind(this)}
                                            value={selectTp}
                                        >
                                            {SELECT_TP_LIST.map((item: any, index: number) => (
                                                <Option key={index} value={item}>
                                                    {SELECT_TP[item] || '全部'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="thr">
                                <Table
                                    rowSelection={rowSelectionM}
                                    columns={columnsModel}
                                    dataSource={paperData}
                                    pagination={false}
                                    size={'middle'}
                                    bordered={false}
                                />
                            </div>
                            <div className={paperData.length ? 'pag' : 'display-none'}>
                                <Pagination
                                    defaultCurrent={1}
                                    pageSize={10000000}
                                    current={pageNom}
                                    total={allCountm * 20}
                                    onChange={this.nowPagChangeM.bind(this)}
                                />
                            </div>
                            <div className="mt-20 footer">
                                <div className="left">
                                    <Button
                                        type="primary"
                                        onClick={this.handleSelModule.bind(this)}
                                    >
                                        返回上一步
                                    </Button>
                                </div>
                                <div className="mid">
                                    <div className="tags">
                                        {selectedRowKeysM.map((item: any, index: any) => {
                                            return (
                                                <div
                                                    style={{
                                                        marginLeft: '8px',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <Tag
                                                        closable
                                                        onClose={this.tagClose.bind(
                                                            this,
                                                            item,
                                                            index
                                                        )}
                                                    >
                                                        {item.title || item.stem}
                                                    </Tag>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="length">
                                        已选择{selectedRowKeysM.length}道试题
                                    </div>
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
