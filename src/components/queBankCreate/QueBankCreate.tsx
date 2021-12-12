import React from 'react';
import { Table, Pagination, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QueBankCreate.less';
// import { get, post, baseUrl } from '../../service/tools';
class QueBank extends React.Component {
    state = {
        bankQuery: '',
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

    onBankQueryChange(event: any) {
        this.setState({
            bankQuery: event.target.value,
        });
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

    render() {
        const { columns1, data1, pageNo, allCount, bankQuery } = this.state;
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
                        <div>
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
            </div>
        );
    }
}

export default QueBank;
