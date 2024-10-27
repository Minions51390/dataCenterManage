import React from 'react';
import { Table, Pagination, Input, Button, Modal, Select, message, Radio, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createBrowserHistory } from 'history';
import '../../style/pageStyle/QueBankCreate.less';
import { get, post, baseUrl } from '../../service/tools';
import Highlighter from "react-highlight-words";
import realKu from '../../style/imgs/realKu.png';
export const history = createBrowserHistory();


const { Option } = Select;
const BANK_TYPE_MAP: any = {
    choice: '单选',
    pack: '词汇理解',
    long_reading: '长篇阅读',
    cf_reading: '仔细阅读',
};
const BANK_TYPE_LIST = ['', 'choice', 'pack', 'long_reading', 'cf_reading'];
class QueBank extends React.Component {
    state = {
        bankQuery: '',
        isVisible: false,
        setName: '',
        setType: 'choice',
        setTypeFilter: '',
        genuine: false,
        genuineFilter: 0,
        setTypeList: ['choice', 'pack', 'long_reading', 'cf_reading'],
        pageNo: 1,
        totalCount: 1,
        sortKey: 'updateTime',
        sortOrder: 'desc',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => (
                    <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>
                ),
            },
            {
                title: '题库名称',
                key: 'setName',
                render: this.questionListRender.bind(this),
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
                render: (text: any) => <div>{text.createTime}</div>,
            },
            {
                title: '更新时间',
                key: 'updateTime',
                sorter: true,
                render: (text: any) => <div>{text.updateTime}</div>,
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
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }

    /** 获取题库列表 */
    async getQuestionBankList() {
        const { bankQuery, pageNo, sortKey, sortOrder, selTeacher, setTypeFilter, genuineFilter } =
            this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-set/list?teacherId=${
                selTeacher.teacherId
            }&query=${bankQuery}&sortKey=${sortKey}&sortOrder=${sortOrder}&pageSize=20&pageNo=${pageNo}${
                setTypeFilter ? '&setType=' + setTypeFilter : ''
            }&genuine=${genuineFilter}&all=off`,
        });
        console.log('------------->', res);
        const questionBankList = res?.data?.questionSetList || [];
        const totalCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: questionBankList,
            totalCount,
        });
    }
    questionListRender(text:any){
        const { bankQuery } = this.state;
        return(
            <div className="title">
                {text.genuine ? <img src={realKu} alt="" /> : <div />}
                <Highlighter
                    searchWords={[bankQuery]}
                    autoEscape
                    textToHighlight={text.setName}
                />
            </div>
        )
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
    onsetNameChange(event: any) {
        this.setState({
            setName: event.target.value,
        });
    }

    /** 确认新建 */
    async handleCreateOk(val: any) {
        console.log('handleCreateOk', val);
        const { setName, setType } = this.state;
        this.setState({
            isVisible: false,
        });
        const bankID = await this.confimeNew();
        console.log('bankID', bankID);
        if (bankID) {
            sessionStorage.setItem('bankDetailId', bankID);
            sessionStorage.setItem('bankDetailName', setName);
            console.log(123123, setType);
            if (setType === 'choice') {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetail`;
            } else if (setType === 'pack') {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailPack`;
            } else if (setType === 'long_reading') {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailLongReading`;
            } else {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailCfReading`;
            }
        }
    }

    /** 编辑按钮 */
    clickEditButton(text: any) {
        console.log('clickEditButton', text);
        const bankID = text.setId;
        const setName = text.setName;
        const setType = text.setType;
        sessionStorage.setItem('bankDetailId', bankID);
        sessionStorage.setItem('bankDetailName', setName);
        if (setType === 'choice') {
            window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetail`;
        } else if (setType === 'pack') {
            window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailPack`;
        } else if (setType === 'long_reading') {
            window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailLongReading`;
        } else {
            window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailCfReading`;
        }
    }

    /** 确认新建接口 */
    async confimeNew() {
        const { setName, setType, genuine } = this.state;
        const response: any = await post({
            url: baseUrl + '/api/v1/question-set/',
            data: {
                setName: setName,
                setType: setType,
                genuine,
            },
        });
        if (response.state !== 0) {
            return;
        }
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

    handelSetTypeFilter(val: any) {
        this.setState(
            {
                setTypeFilter: val,
            },
            async () => {
                this.getQuestionBankList();
            }
        );
    }

    handleGenuineFilter(val: any) {
        this.setState(
            {
                genuineFilter: val.target.checked ? 1 : 0,
            },
            async () => {
                this.getQuestionBankList();
            }
        );
    }

    /** 题库题型 */
    handlesetType(val: any) {
        this.setState({
            setType: val,
        });
    }

    /** 切换真题 */
    onGenuineChange(val: any) {
        console.log(val);
        this.setState({
            genuine: val.target.value,
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
            setName,
            setTypeList,
            setType,
            genuine,
            teacher,
            selTeacher,
            setTypeFilter,
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
                        <span className="span">创建人:</span>
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
                        <span className="span" style={{ marginLeft: '24px' }}>
                            题库题型:
                        </span>
                        <Select
                            defaultValue={setTypeFilter}
                            style={{ width: 180 }}
                            placeholder="请选择学员批次"
                            onChange={this.handelSetTypeFilter.bind(this)}
                            value={setTypeFilter}
                        >
                            {BANK_TYPE_LIST.map((item: any, index: number) => (
                                <Option key={index} value={item}>
                                    {BANK_TYPE_MAP[item] || '全部'}
                                </Option>
                            ))}
                        </Select>
                        <Checkbox
                            style={{ marginLeft: '24px' }}
                            onChange={this.handleGenuineFilter.bind(this)}
                        >
                            只看真题题库
                        </Checkbox>
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
                            value={setName}
                            onChange={this.onsetNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                    <div className="module-area">
                        题库题型:
                        <Select
                            defaultValue={setType}
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请选择学员批次"
                            onChange={this.handlesetType.bind(this)}
                            value={setType}
                        >
                            {setTypeList.map((item: any, index: number) => (
                                <Option key={index} value={item}>
                                    {BANK_TYPE_MAP[item] || '未知'}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    {
                        setType === 'choice' ? null : 
                            <div className="module-area">
                                真题题库:
                                <div style={{ width: '294px', marginLeft: '12px' }}>
                                    <Radio.Group onChange={this.onGenuineChange.bind(this)} value={genuine}>
                                        <Radio value>是</Radio>
                                        <Radio value={false}>否</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                    }
                </Modal>
            </div>
        );
    }
}

export default QueBank;
