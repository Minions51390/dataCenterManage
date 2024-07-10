import React from 'react';
import { Table, Pagination, Input, Button, message, PageHeader } from 'antd';
import '../../style/pageStyle/StuRank.less';
import copy from 'clipboard-copy';
import { get, baseUrl } from '../../service/tools';

const mockRollList = [
    {
        examPaperId: "xxxxx",
        username: "大橙子",
        score: 80,
        finishTime: "2017-10-31 23:12:00",
      	batchName: "一期",
        className: "01班"
    },
    {
        examPaperId: "xxxxx",
        username: "大橙子",
        score: 80,
        finishTime: "2017-10-31 23:12:00",
      	batchName: "一期",
        className: "01班"
    },
    {
        examPaperId: "xxxxx",
        username: "大橙子",
        score: 80,
        finishTime: "2017-10-31 23:12:00",
      	batchName: "一期",
        className: "01班"
    },
]

class StuRank extends React.Component {
    state = {
        routes: [
            {
                path: '/app/test/testRank',
                breadcrumbName: '已发布考试/考试成绩',
            },
            {
                path: '/stuRank',
                breadcrumbName: `${sessionStorage.getItem('banji')}`,
            },
        ],
        pageNo: 1,
        totalCount: 1,
        query: '',
        sortKey: 'score',
        sort: 'desc',
        examId: sessionStorage.getItem('examId'),
        testPaperName: sessionStorage.getItem('testPaperName'),
        pici: sessionStorage.getItem('pici'),
        banji: sessionStorage.getItem('banji'),
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '学员姓名',
                dataIndex: 'username',
                key: 'username',
            },
            {
                title: '考试成绩',
                dataIndex: 'score',
                key: 'score',
                sorter: true,
            },
            {
                title: '考试时间',
                dataIndex: 'finishTime',
                key: 'finishTime',
                sorter: true,
            },
            {
                title: '学员批次',
                dataIndex: 'batchName',
                key: 'batchName',
            },
            {
                title: '班级',
                dataIndex: 'className',
                key: 'className',
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any, record: any) => (
                    <div className="edit">
                        <div className="entry" onClick={() => this.goPaperDetail(record.username, record.examPaperId)}>
                            查看卷面
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

    goPaperDetail = (name: string, examPaperId: string) => {
        window.location.href = `${window.location.pathname}#/app/test/testPaper/stuDetail?name=${name}&examPaperId=${examPaperId}`;
    }

    async inited() {
        this.getTest();
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

    /** 获取成绩列表 */
    async getTest() {
        const { pageNo, query, sortKey, sort, examId } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/list?pageSize=20&pageNo=${pageNo}&examId=${examId}&query=${query}&sortKey=${sortKey}&sort=${sort}`,
        });
        console.log('------------->', res);
        const rollList = res?.data?.examPaperList || mockRollList;
        const totalCount = (res?.data?.totalCount || 0) / 20;
        this.setState({
            data1: rollList,
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

    jumpMistakeRank = () => {
        const { examId, testPaperName, pici, banji } = this.state;
        sessionStorage.setItem('examId', examId || '');
        sessionStorage.setItem('questionPaperName', testPaperName || '');
        sessionStorage.setItem('pici', pici || '');
        sessionStorage.setItem('banji', banji || '');
        window.location.href = `${window.location.pathname}#/app/test/testRank/mistakeRank`;
    }

    render() {
        const { columns1, data1, pageNo, routes, totalCount, query, pici, banji } = this.state;
        return (
            <div className="stu-rank">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">{banji}</div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>
                            <span className="span">学员批次:</span>
                            <span>{pici}</span>
                            <span className="span2">班级:</span>
                            <span>{banji}</span>
                            <Input
                                style={{ width: '240px', marginLeft: '30px' }}
                                placeholder="请输入学生姓名"
                                value={query}
                                onChange={this.onTestQueryChange.bind(this)}
                            />
                            <Button
                                className="gap-30"
                                type="primary"
                                onClick={this.clickSearch.bind(this)}
                            >
                                搜索
                            </Button>
                        </div>
                        <div className="mistakeRank" onClick={this.jumpMistakeRank}>查看错题排行</div>
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

export default StuRank;
