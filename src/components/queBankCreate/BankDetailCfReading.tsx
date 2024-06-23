import React, { useState } from 'react';
import { Table, Pagination, Input, Button, Modal, PageHeader, Select, Radio } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/BankDetailCfReading.less';
import CfReading from '../preview/cfReading/index';
import { get, post, put, baseUrl } from '../../service/tools';
import realItem from '../../style/imgs/realItem.png';
import realKu from '../../style/imgs/realKu.png';

const { Option } = Select;
const ENUM_BANK_TYPE: any = {
    choice: '单选',
    pack: '词汇理解',
    long_reading: '长篇阅读',
    cf_reading: '仔细阅读',
};

const SELECT_TP: any = {
    cet4: 'CET4',
    cet6: 'CET6',
};

const SELECT_TP_LIST = ['', 'cet4', 'cet6'];

let YEAR_MAP = new Array(new Date().getFullYear() - 1950).fill(0).map((item, index) => {
    return `${index + 1951}`;
});
YEAR_MAP.push('');
YEAR_MAP = YEAR_MAP.reverse();

const { TextArea } = Input;
class BankDetailCfReading extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetailCfReading',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建'}题库`,
            },
        ],
        bankQuery: '',
        isVisible: false,
        uploadVisible: false,
        pageNo: 1,
        totalCount: 1,
        /** 默认数据 */
        bankID: sessionStorage.getItem('bankDetailId') || '',
        setName: sessionStorage.getItem('bankDetailName') || '',
        creator: '',
        createTime: '0000-00-00 00:00:00',
        updateTime: '0000-00-00 00:00:00',
        setType: 'long_reading',
        questionCount: '120',
        genuine: false,
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => (
                    <div className="number">
                        {text.genuine ? <img src={realItem} alt="" /> : <div />}
                        {index + 1 + (this.state.pageNo - 1) * 20}
                    </div>
                ),
            },
            {
                title: '真题年份',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{text.year}</div>,
            },
            {
                title: '真题类型',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{SELECT_TP[text.tp]}</div>,
            },
            {
                title: '试题内容',
                key: 'setName',
                render: this.choiceRender.bind(this),
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="edit">
                        <div onClick={this.showPreviewModal.bind(this, text)}>预览</div>
                        <div onClick={this.showCreateModal.bind(this, 'edit', text)}>编辑</div>
                        <div onClick={this.showCreateModal.bind(this, 'del', text)}>删除</div>
                    </div>
                ),
            },
        ],
        data1: [],
        moduleName: '编辑题目',
        canEdit: true,
        title: '',
        stem: '',
        questions: [],
        questionId: '',
        staticGenuine: false,
        staticYear: '',
        staticType: '',
        fileList: [],
        selectYear: '',
        selectTp: '',
        showPreview: false,
        previewData: {},
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const bankData = await this.getQuestionBank();
        console.log('bankData', bankData);
        this.setState({ ...bankData });
        this.getQuestionList();
    }

    choiceRender(text: any) {
        return (
            <div className="title">
                <div className="name">{text.title}</div>
                <div className="stem">{text.stem}</div>
            </div>
        );
    }

    /** 单个题库信息 */
    async getQuestionBank() {
        const { bankID } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-set/?setId=${bankID}`,
        });
        return (
            res?.data || {
                bankID: '',
                creator: '老实',
                createTime: '0000-00-00 00:00:00',
                updateTime: '0000-00-00 00:00:00',
                setType: 'long_reading',
                questionCount: '120',
                genuine: false,
            }
        );
    }

    /** 题库试题列表 */
    async getQuestionList() {
        const { bankID, bankQuery, pageNo, selectTp, selectYear } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-set/question/list?setId=${bankID}&query=${bankQuery}${
                selectYear ? '&year=' + selectYear + '' : ''
            }${selectTp ? '&tp=' + selectTp + '' : ''}&pageSize=20&pageNo=${pageNo}`,
        });
        const questionBankList = res?.data?.questionList || [];
        const totalCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: questionBankList,
            totalCount,
            questionCount: res?.data?.totalCount,
        });
    }

    /** 搜索 */
    onBankQueryChange(event: any) {
        this.setState({
            bankQuery: event.target.value,
        });
    }

    /** 确认编辑 */
    handleCreateOk(val: any) {
        const { canEdit } = this.state;
        if (canEdit) {
            /** 更新数据接口 */
            this.editQuestionInterface();
        } else {
            /** 删除数据接口 */
            this.delQuestionInterface();
        }
        this.setState({
            isVisible: false,
        });
    }

    /** 编辑单个试题 */
    async editQuestionInterface() {
        const { questionId, setType, title, stem, questions, bankID } = this.state;
        console.log('editQuestionInterface', questionId);
        await put({
            url: `${baseUrl}/api/v1/question-set/question`,
            data: {
                questionId: questionId,
                stem,
                title,
                setType,
                questions,
                setId: bankID,
            },
        });
        this.getQuestionList();
    }

    /** 删除接口 */
    async delQuestionInterface() {
        const { questionId, bankID, setType } = this.state;
        await post({
            url: `${baseUrl}/api/v1/question-set/question/delete`,
            data: {
                questionId,
                setId: bankID,
                setType,
            },
        });
        this.getQuestionList();
    }

    showPreviewModal(data: any) {
        this.setState({
            showPreview: true,
            previewData: data,
        });
    }

    cancelPreviewModal() {
        this.setState({
            showPreview: false,
        });
    }

    /** 取消编辑 */
    handleCreateCancel(val: any) {
        this.setState({
            isVisible: false,
        });
    }

    /** 展示编辑弹窗 */
    showCreateModal(type: string, data: any) {
        const { questionId, stem, title, questions, tp, year, genuine } = data;
        if (type === 'edit') {
            this.setState({
                isVisible: true,
                showPreview: false,
                moduleName: '编辑题目',
                canEdit: true,
                questionId,
                title,
                stem,
                questions,
                staticGenuine: genuine,
                staticYear: year,
                staticType: tp,
            });
        } else {
            this.setState({
                isVisible: true,
                showPreview: false,
                moduleName: '确认删除该试题？',
                canEdit: false,
                questionId,
                title,
                stem,
                questions,
                staticGenuine: genuine,
                staticYear: year,
                staticType: tp,
            });
        }
    }

    /** 更换页码 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
                this.getQuestionList();
            }
        );
    }

    /** 搜索接口 */
    searchQuery() {
        this.setState(
            {
                pageNo: 1,
            },
            () => {
                this.getQuestionList();
            }
        );
    }

    handleTitle(event: any) {
        const valData = event.target.value;
        this.setState({
            title: valData,
        });
    }

    handleStem(event: any) {
        const valData = event.target.value;
        this.setState({
            stem: valData,
        });
    }

    updateQStem(val: any, index: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        (questions[index] as any).qStem = valData;
        this.setState({
            questions,
        });
    }

    updateOptionVal(val: any, index: number, key: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        (questions[index] as any).options[key].value = valData;
        this.setState({
            questions,
        });
    }

    updateRightChange(val: any, index: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        (questions[index] as any).rightKey = valData;
        this.setState({
            questions,
        });
    }

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
            bankID,
            setName,
            genuine,
            bankQuery,
            routes,
            creator,
            createTime,
            setType,
            updateTime,
            questionCount,
            columns1,
            data1,
            totalCount,
            pageNo,
            isVisible,
            moduleName,
            canEdit,
            selectYear,
            selectTp,
            stem,
            title,
            questions,
            showPreview,
            previewData,
            staticGenuine,
            staticYear,
            staticType,
        } = this.state;
        return (
            <div className="bank-detail-cf-reading-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">
                            {genuine ? <img src={realKu} alt="" /> : ''}
                            {setName}
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
                            <div className="sp">共计题数</div>
                        </div>
                        <div className="tr">
                            <div>
                                题库题型：<span>{ENUM_BANK_TYPE[setType]}</span>
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
                                placeholder="搜索试题"
                                value={bankQuery}
                                onChange={this.onBankQueryChange.bind(this)}
                            />
                            <Button
                                className="gap-12"
                                type="primary"
                                onClick={this.searchQuery.bind(this)}
                            >
                                查询
                            </Button>
                            <div className="gap-12">
                                {genuine ? '真题' : ''}年份:
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
                                {genuine ? '真题' : ''}类型:
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
                            <div className="gap-12">
                                <Link
                                    to={`/app/queBankCreate/bankDetailCfReading/questionAddCfReading?bankID=${bankID}&setType=${setType}&questionCount=${questionCount}&genuine=${+genuine}`}
                                >
                                    <Button type="primary" icon={<PlusOutlined />}>
                                        新建
                                    </Button>
                                </Link>
                            </div>
                            {/* {setType === 'choice' ? (
                                <Button
                                    icon={<UploadOutlined />}
                                    className="gap-12"
                                    type="primary"
                                    onClick={this.handleUpload.bind(this)}
                                >
                                    批量上传
                                </Button>
                            ) : (
                                <></>
                            )} */}
                        </div>
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
                    title={moduleName}
                    visible={isVisible}
                    bodyStyle={{ height: '500px', overflow: 'auto' }}
                    width="900px"
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="cf-input-block">
                        <div className="mt-8">
                            <span>是否为真题：{staticGenuine ? '是' : '否'}</span>
                            <span style={{ marginLeft: '36px' }}>年份：{staticYear}</span>
                            <span style={{ marginLeft: '36px' }}>
                                类型：{SELECT_TP[staticType]}
                            </span>
                        </div>
                        <div className="firLine">
                            <div>标题:</div>
                            <Input
                                className="ml-14"
                                disabled={!canEdit}
                                placeholder="请输入"
                                value={title}
                                style={{ width: 180 }}
                                onChange={this.handleTitle.bind(this)}
                            />
                        </div>
                        <div className="secLine">
                            <div className="mt-8">短文:</div>
                            <TextArea
                                className="mt-8"
                                disabled={!canEdit}
                                value={stem}
                                onChange={this.handleStem.bind(this)}
                                style={{ height: 240, resize: 'none' }}
                            />
                        </div>
                        <div className="thrLine">
                            <div className="mt-8">小题:</div>
                            <div className="mt-8 option-area">
                                {questions.map((val: any, index) => (
                                    <div className="item">
                                        <div className="titleBlock">
                                            <span className="title">{index + 1}：</span>
                                            <Input
                                                className="gap-8"
                                                disabled={!canEdit}
                                                value={val.qStem}
                                                style={{ flex: 1 }}
                                                onChange={this.updateQStem.bind(this, val, index)}
                                            />
                                        </div>
                                        <div className="questionBlock">
                                            <div className="left">
                                                {val.options.map((val: any, key: number) => {
                                                    return (
                                                        <div className="optionBlock">
                                                            <div className="title">{val.key} :</div>
                                                            <Input
                                                                className="gap-8"
                                                                disabled={!canEdit}
                                                                value={val.value}
                                                                style={{ flex: 1 }}
                                                                onChange={this.updateOptionVal.bind(
                                                                    this,
                                                                    val,
                                                                    index,
                                                                    key
                                                                )}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="right">
                                                <div className="checkBlock">
                                                    <Radio.Group
                                                        className="myRadio"
                                                        onChange={this.updateRightChange.bind(
                                                            this,
                                                            val,
                                                            index
                                                        )}
                                                        value={val.rightKey}
                                                    >
                                                        <Radio
                                                            className="inner"
                                                            disabled={!canEdit}
                                                            value="A"
                                                        >
                                                            {val.rightKey === 'A'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                        <Radio
                                                            className="inner"
                                                            disabled={!canEdit}
                                                            value="B"
                                                        >
                                                            {val.rightKey === 'B'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                        <Radio
                                                            className="inner"
                                                            disabled={!canEdit}
                                                            value="C"
                                                        >
                                                            {val.rightKey === 'C'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                        <Radio
                                                            className="inner"
                                                            disabled={!canEdit}
                                                            value="D"
                                                        >
                                                            {val.rightKey === 'D'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    title="预览"
                    visible={showPreview}
                    width={900}
                    bodyStyle={{ height: '540px', overflow: 'auto' }}
                    onCancel={this.cancelPreviewModal.bind(this)}
                    footer={[
                        <Button
                            type="primary"
                            onClick={this.showCreateModal.bind(this, 'edit', previewData)}
                        >
                            编辑
                        </Button>,
                    ]}
                >
                    <div>
                        <CfReading dataSource={previewData} />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default BankDetailCfReading;
