import React, { useState } from 'react';
import { Table, Pagination, Input, Button, Modal, PageHeader, message, Select } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/BankDetailPack.less';
import { get, post, put, baseUrl } from '../../service/tools';
import type { RcFile } from 'antd/es/upload/interface';
const { Option } = Select;

const ENUM_BANK_TYPE: any = {
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

const { TextArea } = Input;
class BankDetailPack extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetailPack',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建'}题库`,
            },
        ],
        bankQuery: '',
        isVisible: false,
        uploadVisible: false,
        // setTypeList: ['choice'], //['pack'],
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
        columns1: [
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
        options: [],
        questionId: '',
        fileList: [],
        selectYear: '',
        selectTp: '',
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

    /** 题干名称 */
    handleStem(event: any) {
        this.setState({
            stem: event.target.value,
        });
    }

    /** 标题 */
    handleTitle(event: any) {
        const valData = event.target.value;
        this.setState({
            title: valData,
        });
    }

    /** 更新选项 */
    updateOptions(val: any, index: number, event: any) {
        const { options } = this.state;
        const valData = event.target.value;
        (options[index] as any).value = valData;
        this.setState({
            options,
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
        const { questionId, stem, options, setType, title, bankID } = this.state;
        console.log('editQuestionInterface', questionId);
        await put({
            url: `${baseUrl}/api/v1/question-set/question`,
            data: {
                questionId: questionId,
                stem: stem,
                title: title,
                setType,
                options,
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

    /** 下载模板 */
    async loadTemplate() {
        const template = await get({
            url: `${baseUrl}/static/template/question-set-template.xls`,
            config: {
                responseType: 'blob',
            },
        });
        const aElement = document.createElement('a');
        aElement.setAttribute('download', '模版');
        const href = URL.createObjectURL(template);
        aElement.href = href;
        aElement.setAttribute('target', '_blank');
        aElement.click();
        URL.revokeObjectURL(href);
    }

    /** 取消编辑 */
    handleCreateCancel(val: any) {
        this.setState({
            isVisible: false,
        });
    }

    /** 展示编辑弹窗 */
    showCreateModal(type: string, data: any) {
        const { questionId, stem, title, options } = data;
        if (type === 'edit') {
            this.setState({
                isVisible: true,
                moduleName: '编辑题目',
                canEdit: true,
                questionId,
                stem,
                title,
                options,
            });
        } else {
            this.setState({
                isVisible: true,
                moduleName: '确认删除该试题？',
                canEdit: false,
                questionId,
                stem,
                title,
                options,
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

    /** 文件上传 */
    handleUpload() {
        this.setState({
            uploadVisible: true,
        });
    }

    /** 确定上传 */
    async handleUploadOk() {
        this.handleUploadCancel();
        message.success('上传中...');
        const { bankID, fileList } = this.state;
        const formData = new FormData();
        fileList.forEach((file: any) => {
            formData.append('setId', bankID);
            formData.append('file', file as RcFile);
        });
        const res = await post({
            url: `${baseUrl}/api/v1/question-set/question/file`,
            data: formData,
            config: {
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'multipart/form-data;',
                },
            },
        });
        if (res.state === 0) {
            this.setState({
                fileList: [],
            });
            message.success('上传成功');
            this.inited();
        } else {
            message.error('上传失败');
        }
    }

    /** 取消上传 **/
    handleUploadCancel() {
        this.setState({
            uploadVisible: false,
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
            title,
            stem,
            options,
            selectYear,
            selectTp,
        } = this.state;
        return (
            <div className="bank-detail-pack-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{setName}</div>
                        {/* <Button onClick={this.delBank.bind(this)}>删除题库</Button> */}
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
                            <div className="gap-12">
                                <Link
                                    to={`/app/queBankCreate/bankDetailPack/questionAddPack?bankID=${bankID}&setType=${setType}`}
                                >
                                    <Button type="primary" icon={<PlusOutlined />}>
                                        新建
                                    </Button>
                                </Link>
                            </div>
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
                    width="800px"
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="pack-input-block">
                        <div className="left">
                            <div className="mt-8">标题:</div>
                            <Input
                                disabled={!canEdit}
                                className="mt-8"
                                placeholder="请输入"
                                value={title}
                                onChange={this.handleTitle.bind(this)}
                            />
                            <div className="mt-8">题干:</div>
                            <TextArea
                                disabled={!canEdit}
                                className="mt-8"
                                value={stem}
                                onChange={this.handleStem.bind(this)}
                                style={{ height: 500, resize: 'none' }}
                            />
                            <div className="tips">
                                *提示：在输入题干文本时，选词的地方用(\选项\)表示； *示例：Let there
                                be (\A\). [假设选项A是"light"]
                            </div>
                        </div>
                        <div className="right">
                            <div className="mt-8">选项:</div>
                            <div className="mt-8 option-area">
                                {options.map((val: any, index) => (
                                    <div className="item">
                                        <span className="title">{val.key}：</span>
                                        <Input
                                            disabled={!canEdit}
                                            className="gap-8"
                                            value={val.value}
                                            style={{ flex: 1 }}
                                            onChange={this.updateOptions.bind(this, val, index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default BankDetailPack;
