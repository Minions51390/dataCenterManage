import React, { useState } from 'react';
import { Table, Pagination, Input, Button, Modal, PageHeader, Upload, message, Select } from 'antd';
import { Link } from 'react-router-dom';
import {
    PlusOutlined,
    UploadOutlined,
    DownloadOutlined,
    FileAddOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import '../../style/pageStyle/BankDetail.less';
import { get, post, del, put, baseUrl } from '../../service/tools';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import Choice from '../preview/choice';

const { Dragger } = Upload;
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
class BankDetail extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetail',
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
        setType: 'choice',
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
        queName: '',
        queNameA: '',
        queNameB: '',
        queNameC: '',
        queNameD: '',
        queNameR: '',
        questionId: '',
        fileList: [],
        selectYear: '',
        selectTp: '',
        showPreview: false,
        previewData: {},
        // setFileList: useState<UploadFile[]>([]),
        // fileList: useState<UploadFile[]>([])
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
    onQueNameChange(event: any) {
        this.setState({
            queName: event.target.value,
        });
    }

    /** A名称 */
    onQueNameChangeA(event: any) {
        this.setState({
            queNameA: event.target.value,
        });
    }

    /** B名称 */
    onQueNameChangeB(event: any) {
        this.setState({
            queNameB: event.target.value,
        });
    }

    /** C名称 */
    onQueNameChangeC(event: any) {
        this.setState({
            queNameC: event.target.value,
        });
    }

    /** D名称 */
    onQueNameChangeD(event: any) {
        this.setState({
            queNameD: event.target.value,
        });
    }

    /** 正确名称 */
    onQueNameChangeR(event: any) {
        this.setState({
            queNameR: event.target.value,
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
        const { questionId, queName, queNameA, queNameB, queNameC, queNameD, queNameR, setType } =
            this.state;
        console.log('editQuestionInterface', questionId);
        await put({
            url: `${baseUrl}/api/v1/question-set/question`,
            data: {
                questionId: questionId,
                stem: queName,
                setType,
                options: [
                    {
                        key: 'A',
                        value: queNameA,
                    },
                    {
                        key: 'B',
                        value: queNameB,
                    },
                    {
                        key: 'C',
                        value: queNameC,
                    },
                    {
                        key: 'D',
                        value: queNameD,
                    },
                ],
                rightKey: queNameR,
            },
        });
        this.getQuestionList();
    }

    /** 删除接口 */
    async delQuestionInterface() {
        const { questionId } = this.state;
        await post({
            url: `${baseUrl}/api/v1/question-set/question/delete`,
            data: {
                questionId,
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
        const { questionId, stem, options, rightKey } = data;
        if (type === 'edit') {
            this.setState({
                isVisible: true,
                showPreview: false,
                moduleName: '编辑题目',
                canEdit: true,
                questionId,
                queName: stem,
                queNameA: options[0].value,
                queNameB: options[1].value,
                queNameC: options[2].value,
                queNameD: options[3]?.value || '',
                queNameR: rightKey,
            });
        } else {
            this.setState({
                isVisible: true,
                showPreview: false,
                moduleName: '确认删除该试题？',
                canEdit: false,
                questionId,
                queName: stem,
                queNameA: options[0].value,
                queNameB: options[1].value,
                queNameC: options[2].value,
                queNameD: options[3]?.value || '',
                queNameR: rightKey,
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
            uploadVisible,
            moduleName,
            canEdit,
            queName,
            queNameA,
            queNameB,
            queNameC,
            queNameD,
            queNameR,
            fileList,
            selectYear,
            selectTp,
            showPreview,
            previewData,
        } = this.state;

        const uploadProps = {
            name: 'file',
            multiple: false,
            action: `${baseUrl}/api/v1/question-set/question/file`,
            maxCount: 1,
            data: {
                setId: bankID,
            },
            onChange: (info: any) => {
                console.log(info);
                if (info.file.status === 'done') {
                    // console.log(info,'done');
                    let res = info.file.response;
                    // console.log(res.data)
                    if (res.state === 0) {
                        // 初始化
                        this.inited();
                        console.log('初始化');
                    }
                    message.success(`${info.file.name} 上传成功`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
            onDrop(e: any) {
                console.log('Dropped files', e.dataTransfer.files);
            },
            onRemove: (file: any) => {
                this.setState({
                    fileList: [],
                });
            },
            beforeUpload: (file: any) => {
                this.setState({
                    fileList: [...fileList, file],
                });
                return false;
            },
            fileList,
        };

        return (
            <div className="bank-detail-wrapper">
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
                                    to={`/app/queBankCreate/bankDetail/questionAdd?bankID=${bankID}&setType=${setType}`}
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
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="module-area">
                        <span className="title">题干：</span>
                        <TextArea
                            disabled={!canEdit}
                            className="gap-8"
                            style={{ width: 294 }}
                            value={queName}
                            onChange={this.onQueNameChange.bind(this)}
                        />
                    </div>
                    <div className="module-area">
                        <span className="title">A：</span>
                        <Input
                            disabled={!canEdit}
                            className="gap-8"
                            style={{ width: 294 }}
                            value={queNameA}
                            onChange={this.onQueNameChangeA.bind(this)}
                        />
                    </div>
                    <div className="module-area">
                        <span className="title">B：</span>
                        <Input
                            disabled={!canEdit}
                            className="gap-8"
                            style={{ width: 294 }}
                            value={queNameB}
                            onChange={this.onQueNameChangeB.bind(this)}
                        />
                    </div>
                    <div className="module-area">
                        <span className="title">C：</span>
                        <Input
                            disabled={!canEdit}
                            className="gap-8"
                            style={{ width: 294 }}
                            value={queNameC}
                            onChange={this.onQueNameChangeC.bind(this)}
                        />
                    </div>
                    <div className="module-area">
                        <span className="title">D：</span>
                        <Input
                            disabled={!canEdit}
                            className="gap-8"
                            style={{ width: 294 }}
                            value={queNameD}
                            onChange={this.onQueNameChangeD.bind(this)}
                        />
                    </div>
                    <div className="module-area">
                        <span className="title">正确选项：</span>
                        <Input
                            disabled={!canEdit}
                            className="gap-8"
                            style={{ width: 294 }}
                            value={queNameR}
                            onChange={this.onQueNameChangeR.bind(this)}
                        />
                    </div>
                </Modal>
                <Modal
                    width={800}
                    title="模版导入"
                    visible={uploadVisible}
                    onOk={this.handleUploadOk.bind(this)}
                    onCancel={this.handleUploadCancel.bind(this)}
                >
                    <div className="modal-top">
                        <div className="modal-text">
                            <div className="text-left">
                                <span className="red">*</span>
                                <span className="text">导入Excel文件：</span>
                            </div>
                        </div>
                        <Button
                            icon={<DownloadOutlined />}
                            className="gap-12 load-template"
                            type="primary"
                            onClick={this.loadTemplate.bind(this)}
                        >
                            模版下载
                        </Button>
                    </div>
                    <div className="modal-drag">
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">点击选择本地文件</p>
                            <p className="ant-upload-hint">或将Excel文件直接拖入此区域内</p>
                        </Dragger>
                    </div>
                </Modal>
                <Modal
                    title="预览"
                    visible={showPreview}
                    width={600}
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
                        <Choice dataSource={previewData} />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default BankDetail;
