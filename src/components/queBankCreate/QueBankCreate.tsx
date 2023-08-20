import React from 'react';
import { Table, Pagination, Input, Button, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createBrowserHistory } from 'history';
import '../../style/pageStyle/QueBankCreate.less';
import { get, post, baseUrl } from '../../service/tools';
export const history = createBrowserHistory();
const { Option } = Select;
const BANK_TYPE_MAP: any = {
    choice: '单选',
    pack: '填空',
};
class QueBank extends React.Component {
    state = {
        bankQuery: '',
        isVisible: false,
        bankName: '',
        bankType: 'choice',
        bankTypeList: ['choice', 'pack'],
        pageNo: 1,
        totalCount: 1,
        sortKey: 'creator',
        sortOrder: 'asc',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
            },
            {
                title: '题库名称',
                dataIndex: 'setName',
                key: 'bankName',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
                sorter: true,
            },
            {
                title: '题库题型',
                key: 'setType',
                sorter: true,
                render: (text: any) => <div>{BANK_TYPE_MAP[text.setType] || '未知'}</div>,
            },
            {
                title: '创建时间',
                key: 'createTime',
                sorter: true,
                render: (text: any) => <div>{text.createTime.split(' ')[0]}</div>,
            },
            {
                title: '更新时间',
                key: 'updateTime',
                sorter: true,
                render: (text: any) => <div>{text.updateTime.split(' ')[0]}</div>,
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="edit" onClick={this.clickEditButton.bind(this, text)}>
                        <div>编辑</div>
                    </div>
                ),
            },
        ],
        data1: [],
        teacher: [],
        selTeacher: {
            teacherId: '',
            realName: '',
        },
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === Number(localStorage.getItem('classTeacherId'));
        });
        this.setState({
            teacher,
            selTeacher,
        });
        this.getQuestionBankList();
    }

    /** 获取教师列表 */
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list` });
        return res?.data ?? [];
    }

    /** 获取题库列表 */
    async getQuestionBankList() {
        const { bankQuery, pageNo, sortKey, sortOrder, selTeacher } = this.state;
        console.log('selTeacher', selTeacher);
        let res = await get({
            url: `${baseUrl}/api/v1/question-set/list?creatorId=${selTeacher.teacherId}&query=${bankQuery}&sortKey=${sortKey}&sortOrder=${sortOrder}&pageSize=20&pageNo=${pageNo}&all=off`,
        });
        console.log('------------->', res);
        const questionBankList = res?.data?.questionSetList || [];
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

    /** 点击搜索按钮 */
    clickSearch() {
        this.setState(
            {
                pageNo: 1,
            },
            () => {
                this.getQuestionBankList();
            }
        );
    }

    /** 题库名称 */
    onBankNameChange(event: any) {
        this.setState({
            bankName: event.target.value,
        });
    }

    /** 确认新建 */
    async handleCreateOk(val: any) {
        console.log('handleCreateOk', val);
        const { bankName } = this.state;
        this.setState({
            isVisible: false,
        });
        const bankID = await this.confimeNew();
        console.log('bankID', bankID);
        sessionStorage.setItem('bankDetailId', bankID);
        sessionStorage.setItem('bankDetailName', bankName);
        window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetail`;
    }

    /** 编辑按钮 */
    clickEditButton(text: any) {
        console.log('clickEditButton', text);
        const bankID = text.setId;
        const bankName = text.setName;
        sessionStorage.setItem('bankDetailId', bankID);
        sessionStorage.setItem('bankDetailName', bankName);
        window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetail`;
    }

    /** 确认新建接口 */
    async confimeNew() {
        const { bankName, bankType } = this.state;
        const response: any = await post({
            url: baseUrl + '/api/v1/question-set/',
            data: {
                setName: bankName,
                setType: bankType,
            },
        });
        console.log('confimeNew', response);
        return response?.data?.setId || '';
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

    /** 更换页码 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
                this.getQuestionBankList();
            }
        );
    }
    /** 教师切换 */
    handleTeacher(val: any) {
        const { teacher } = this.state;
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === val;
        });
        this.setState(
            {
                selTeacher,
            },
            async () => {
                this.getQuestionBankList();
            }
        );
    }

    /** 题库题型 */
    handleBankType(val: any) {
        this.setState({
            bankType: val,
        });
    }

    /** 排序更换触发 */
    tableChange(pagination: any, filters: any, sorter: any, extra: any) {
        if (sorter?.columnKey) {
            const sortOrder = (sorter?.order || '').replace('end', '');
            this.setState(
                {
                    sortKey: sorter?.columnKey,
                    sortOrder,
                },
                () => {
                    this.getQuestionBankList();
                }
            );
        }
        console.log(pagination, filters, sorter, extra);
    }

    render() {
        const {
            columns1,
            data1,
            pageNo,
            totalCount,
            bankQuery,
            isVisible,
            bankName,
            bankTypeList,
            bankType,
            teacher,
            selTeacher,
        } = this.state;
        return (
            <div className="quebank-wrapper">
                <div className="header">
                    <div className="fir">题库建设</div>
                    <div className="sec">题库列表</div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>
                            搜索题库:
                            <Input
                                className="gap-12"
                                style={{ width: 272 }}
                                placeholder="请输入关键词"
                                value={bankQuery}
                                onChange={this.onBankQueryChange.bind(this)}
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
                            value={
                                selTeacher?.realName ||
                                (teacher[0] && (teacher[0] as any).realName) ||
                                '请选择'
                            }
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
                            onChange={this.tableChange.bind(this)}
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
                    title="新增词库"
                    visible={isVisible}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="module-area">
                        题库名称:
                        <Input
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请输入题库名称"
                            value={bankName}
                            onChange={this.onBankNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                    <div className="module-area">
                        题库题型:
                        <Select
                            defaultValue={bankType}
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请选择学员批次"
                            onChange={this.handleBankType.bind(this)}
                            value={bankType}
                        >
                            {bankTypeList.map((item: any, index: number) => (
                                <Option key={index} value={item}>
                                    {BANK_TYPE_MAP[item] || '未知'}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default QueBank;
