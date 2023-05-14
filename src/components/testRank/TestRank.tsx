import React from 'react';
import { Table, Pagination, Input, Button, message, Select, Popconfirm } from 'antd';
import '../../style/pageStyle/TestRank.less';
import copy from 'clipboard-copy';
import { get, del, baseUrl } from '../../service/tools';
const { Option } = Select;

const mockExamList = [
    {
        examID:"4175d9df-f29c-4a59-819f-d2b0e92b6dcb",
        testPaperName:"初三下册第一次测验",
        creator:"大橙子",
        testPaperID:"4175d9df-f29c-4a59-819f-d2b0e92b6dcb",
        examTime:"2022-03-19 17:56:43",
        status:1,
    },
    {
        examID:"4175d9df-f29c-4a59-819f-d2b0e92b6dcb",
        testPaperName:"初三下册第一次测验",
        creator:"大橙子",
        testPaperID:"4175d9df-f29c-4a59-819f-d2b0e92b6dcb",
        examTime:"2022-03-19 17:56:43",
        status:2,
    },
    {
        examID:"4175d9df-f29c-4a59-819f-d2b0e92b6dcb",
        testPaperName:"初三下册第一次测验",
        creator:"大橙子",
        testPaperID:"4175d9df-f29c-4a59-819f-d2b0e92b6dcb",
        examTime:"2022-03-19 17:56:43",
        status:2,
    },
];

const statusTextList = ['全部', '待考试', '已考'];

class TestRank extends React.Component {
    state = {
        pageNo: 1,
        totalCount: 1,
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        query: '',
        queryType: 'testPaperName',
        queryTypeList: [
            {
                type: 'testPaperName',
                name: '考试名称',
            },
            {
                type: 'creator',
                name: '创建人',
            },
            {
                type: 'testPaperID',
                name: '考试ID',
            }
        ],
        statusList: [
            {
                id: 0,
                name: '全部',
            },
            {
                id: 1,
                name: '待考试',
            },
            {
                id: 2,
                name: '已考',
            },
        ],
        status: 0,
        sortKey: 'creator',
        sort: 'asc',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
            },
            {
                title: '试卷名称',
                dataIndex: 'testPaperName',
                key: 'testPaperName',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
                sorter: true,
            },
            {
                title: '试卷ID',
                key: 'testPaperID',
                render: (text: any) => (
                    <div className="edit">
                        <div className="copy" onClick={this.copyIdFn.bind(this, text.testPaperID)}>
                            <div>{text.testPaperID}</div>
                        </div>
                    </div>
                ),
            },
            {
                title: '考试时间',
                dataIndex: 'examTime',
                key: 'examTime',
                sorter: true,
            },
            {
                title: '试卷状态',
                key: 'status',
                render: (text: any) => (
                    <div>
                        {statusTextList[text.status]}
                    </div>
                ),
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="edit">
                        {
                            text.status !== 2 ?
                            <Popconfirm placement="topLeft" title="是否确认删除？删除后无法恢复!" okText="确认" cancelText="取消" onConfirm={this.delExam.bind(this, text.testPaperID)}>
                                <div className="copy">
                                    <div>删除</div>
                                </div>
                            </Popconfirm>
                            :
                            <div className="gray">
                                删除
                            </div>
                        }
                        <div className="entry" onClick={() => this.jumpMistake(text)}>
                            错题排行
                        </div>
                        <div className="entry" onClick={this.jumpStu.bind(this, text)}>
                            成绩排行
                        </div>
                    </div>
                ),
            },
        ],
        data1: [],
    };
    componentWillMount() {
        this.inited();
    }

    async inited() {
        const pici = await this.getPici();
        const banji = await this.getClass(pici[0].batchId);
        this.setState({
            pici,
            banji,
            selPici: pici[0].batchId,
            selBanji: banji[0].classId,
        }, () => {
            this.getTest();
        });
    }

    /** 更换批次列表 */
    async handlePiCi(val: any) {
        let res = await this.getClass(val);
        this.setState({
            selPici: val,
            banji: res,
            selBanji: res[0] ? res[0].classId : 0,
        });
    }

    /** 更换班级列表 */
    handleBanji(val: any) {
        this.setState({
            selBanji: val,
        });
    }

    /** 更换考试状态 */
    handleStatus(val: any) {
        this.setState({
            status: val,
        });
    }

    /** query的种类 */
    handleQueryType(val: any) {
        this.setState({
            queryType: val,
        });
    }

    /** 搜索 */
    onTestQueryChange(event: any) {
        this.setState({
            query: event.target.value,
        });
    }

    /** 排序更换触发 */
    tableChange(pagination: any, filters: any, sorter: any, extra: any) {
        if (sorter?.columnKey) {
            const sort = (sorter?.order || '').replace('end', '');
            this.setState(
                {
                    sortKey: sorter?.columnKey,
                    sort,
                },
                () => {
                    this.getTest();
                }
            );
        }
        console.log(pagination, filters, sorter, extra);
    }

    jumpStu(text: any) {
        console.log(text);
        const { examID, testPaperName } = text;
        const { selPici, selBanji, pici, banji } = this.state;
        let piciName = '';
        let banjiName = '';
        pici.map((item: any) => {
            if (item.batchId === selPici) {
                piciName = item.describe;
            }
            return item;
        });
        banji.map((item: any) => {
            if (item.classId === selBanji) {
                banjiName = item.describe;
            }
            return item;
        });
        sessionStorage.setItem('examID', examID);
        sessionStorage.setItem('testPaperName', testPaperName);
        sessionStorage.setItem('pici', piciName);
        sessionStorage.setItem('banji', banjiName);
        window.location.href = `${window.location.pathname}#/app/test/testRank/stuRank`;
    }

    jumpMistake = (text: any) => {
        console.log(text);
        const { examID, testPaperName } = text;
        const { selPici, selBanji, pici, banji } = this.state;
        let piciName = '';
        let banjiName = '';
        pici.map((item: any) => {
            if (item.batchId === selPici) {
                piciName = item.describe;
            }
            return item;
        });
        banji.map((item: any) => {
            if (item.classId === selBanji) {
                banjiName = item.describe;
            }
            return item;
        });
        sessionStorage.setItem('examID', examID);
        sessionStorage.setItem('testPaperName', testPaperName);
        sessionStorage.setItem('pici', piciName);
        sessionStorage.setItem('banji', banjiName);
        window.location.href = `${window.location.pathname}#/app/test/testRank/mistakeRank`;
    }

    /** 获取批次列表 */
    async getPici() {
        let res = await get({url: baseUrl + '/api/v1/structure/batch/list'});
        const pici = res.data.detail || [];
        return pici;
    }

    /** 获取班级列表 */
    async getClass(pici: any) {
        let res = await get({url: baseUrl + `/api/v1/structure/class/list?batchId=${pici}&category=all`});
        const banji = res.data.detail || [];
        return banji;
    }

    /** 获取成绩列表 */
    async getTest() {
        const { pageNo, selPici, selBanji, queryType, query, sortKey, sort, status } = this.state;
        let res = await get({
            url: `${baseUrl}/api/exam/list?pageSize=20&pageNo=${pageNo}&batch=${selPici}&class=${selBanji}&queryType=${queryType}&query=${query}&sortKey=${sortKey}&sort=${sort}&status=${status}`,
        });
        console.log('------------->', res);
        const examList = res?.data?.examList || mockExamList;
        const totalCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: examList,
            totalCount,
        });
    }

    /** 点击搜索按钮 */
    clickSearch() {
        this.setState(
            {
                pageNo: 1,
            },
            () => {
                this.getTest();
            }
        );
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
    
    /** 删除考试 */
    async delExam(id: any) {
        let res = await del({ url: baseUrl + `/api/exam?examID=${id}` });
        console.log(res);
        this.getTest();
    }

    render() {
        const { columns1, data1, pageNo, totalCount, selPici, pici, selBanji, banji, query, queryType, queryTypeList, statusList, status } = this.state;
        return (
            <div className="paper-rank">
                <div className="header">
                    <div className="fir">已发布考试/考试成绩</div>
                    <div className="sec">已发布考试/考试成绩</div>
                </div>
                <div className="body">
                    <div className="zero">
                        <Input.Group compact>
                            <Select
                                defaultValue={queryType}
                                value={queryType || "请选择"}
                                onChange={this.handleQueryType.bind(this)}
                            >
                                {
                                    queryTypeList.map((item: any) => (
                                        <Option value={item.type} key={item.classId}>{ item.name }</Option>
                                    ))
                                }
                            </Select>
                            <Input
                                style={{ width: '240px' }}
                                placeholder="待输入"
                                value={query}
                                onChange={this.onTestQueryChange.bind(this)}
                            />
                        </Input.Group>
                        <Button
                            className="gap-30"
                            type="primary"
                            onClick={this.clickSearch.bind(this)}
                        >
                            搜索
                        </Button>
                    </div>
                    <div className="fir">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 140 }}
                            value={selPici || (pici[0] && (pici[0] as any).describe) || "请选择"}
                            onChange={this.handlePiCi.bind(this)}
                        >
                            {pici.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span2">班级:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 140 }}
                            value={selBanji || (banji[0] && (banji[0] as any).describe) || "请选择"}
                            onChange={this.handleBanji.bind(this)}
                        >
                            {banji.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span3">试卷状态:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 140 }}
                            value={status || (statusList[0] && (statusList[0] as any).name) || "请选择"}
                            onChange={this.handleStatus.bind(this)}
                        >
                            {statusList.map((item: any) => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
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
            </div>
        );
    }
}

export default TestRank;
