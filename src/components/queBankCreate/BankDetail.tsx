import React from 'react';
import { Table, Pagination, Input, Button, Modal, PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/BankDetail.less';
import { get, post, del, put, baseUrl } from '../../service/tools';
const ENUM_BANK_TYPE: any = {
    choice: '单选题',
    pack: '填空题',
};
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
        bankTypeList: ['choice', 'pack'],
        pageNo: 1,
        totalCount: 1,
        /** 默认数据 */
        bankID: sessionStorage.getItem('bankDetailId') || '',
        bankName: sessionStorage.getItem('bankDetailName') || '',
        creator: '',
        createTime: '0000-00-00 00:00:00',
        updateTime: '0000-00-00 00:00:00',
        bankType: 'choice',
        questionCount: '120',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
            },
            {
                title: '试题内容',
                key: 'bankName',
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
        queName: '',
        queNameA: '',
        queNameB: '',
        queNameC: '',
        queNameD: '',
        queNameR: '',
        questionId: '',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const bankData = await this.getQuestionBank();
        this.setState({ ...bankData });
        this.getQuestionList();
    }

    /** 单个题库信息 */
    async getQuestionBank() {
        const { bankID } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-set/?setId=${bankID}`,
        });
        console.log('getQuestionBank', res)
        return (
            res?.data || {
                bankID: '',
                creator: '老实',
                createTime: '0000-00-00 00:00:00',
                updateTime: '0000-00-00 00:00:00',
                bankType: 'choice',
                questionCount: '120',
            }
        );
    }

    /** 题库试题列表 */
    async getQuestionList() {
        const { bankID, bankQuery, pageNo } = this.state;
        const res: any = await get({
            url: `${baseUrl}/api/v1/question-set/question/list?setId=${bankID}&query=${bankQuery}&pageSize=20&pageNo=${pageNo}`,
        });
        const questionBankList = res?.data?.questionList || [];
        const totalCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: questionBankList,
            totalCount,
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
        const { questionId, queName, queNameA, queNameB, queNameC, queNameD, queNameR } =
            this.state;
        console.log('editQuestionInterface', questionId)
        await put({
            url: `${baseUrl}/api/v1/question-set/question`,
            data: {
                questionId: questionId,
                stem: queName,
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
                questionId
            },
        });
        this.getQuestionList();
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

    /** 删除题库 */
    // delBank() {
    //     window.location.href = '/#/app/queBankCreate';
    // }

    render() {
        const {
            bankID,
            bankName,
            bankQuery,
            routes,
            creator,
            createTime,
            bankType,
            updateTime,
            questionCount,
            columns1,
            data1,
            totalCount,
            pageNo,
            isVisible,
            moduleName,
            canEdit,
            queName,
            queNameA,
            queNameB,
            queNameC,
            queNameD,
            queNameR,
        } = this.state;
        return (
            <div className="bank-detail-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{bankName}</div>
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
                                题库类型：<span>{ENUM_BANK_TYPE[bankType]}</span>
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
                            <div className="gap-40">
                                <Link
                                    to={`/app/queBankCreate/bankDetail/questionAdd?bankID=${bankID}`}
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
            </div>
        );
    }
}

export default BankDetail;
