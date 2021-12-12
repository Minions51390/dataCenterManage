import React from 'react';
import { Table, Pagination, Input, Button, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QueBankCreate.less';
// import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class QueBank extends React.Component {
    state = {
        bankQuery: '',
        isVisible: false,
        bankName: '',
        bankType: 'choice',
        bankTypeList: ['choice', 'pack'],
        pageNo: 1,
        allCount: 1,
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '题库名称',
                dataIndex: 'bankName',
                key: 'bankName',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
            },
            {
                title: '题库类型',
                dataIndex: 'bankType',
                key: 'bankType',
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
                        <div>编辑</div>
                        <div>删除</div>
                    </div>
                ),
            },
        ],
        data1: [
            {
                bankID: 'xxxxxxx',
                bankName: 'xxxxx',
                creator: 'xxxx',
                bankType: 'choice',
                createTime: '0000-00-00 00:00:00',
                updateTime: '0000-00-00 00:00:00',
            },
        ],
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {}
    async getRank() {}

    /** 搜索 */
    onBankQueryChange(event: any) {
        this.setState({
            bankQuery: event.target.value,
        });
    }

    /** 题库名称 */
    onBankNameChange(event: any) {
        this.setState({
            bankName: event.target.value,
        });
    }

    /** 确认新建 */
    handleCreateOk(val: any) {
        this.setState({
            isVisible: false,
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

    /** 更换页码 */
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

    /** 题库类型 */
    handleBankType(val: any) {
        this.setState({
            bankType: val,
        });
    }

    render() {
        const {
            columns1,
            data1,
            pageNo,
            allCount,
            bankQuery,
            isVisible,
            bankName,
            bankTypeList,
            bankType,
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
                            <Button className="gap-48" type="primary">
                                查询
                            </Button>
                        </div>
                        <div onClick={this.showCreateModal.bind(this)}>
                            <Button type="primary" icon={<PlusOutlined />}>
                                新增
                            </Button>
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
                            total={allCount * 20}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    title="新增班级"
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
                        />
                    </div>
                    <div className="module-area">
                        题库类型:
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
                                    {item}
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
