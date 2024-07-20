import React from 'react';
import { Table, Pagination, Input, Button, message, PageHeader, Select } from 'antd';
import '../../style/pageStyle/StuRank.less';
import copy from 'clipboard-copy';
import { get, baseUrl } from '../../service/tools';

const { Option } = Select;
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
                breadcrumbName: '成绩排行',
            },
        ],
        pageNo: 1,
        totalCount: 1,
        query: '',
        sortKey: 'score',
        sort: 'desc',
        examId: sessionStorage.getItem('examId'),
        testPaperName: sessionStorage.getItem('testPaperName'),
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        selTeacher: {
            teacherId: '',
            realName: '',
        },
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
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === Number(localStorage.getItem('classTeacherId'));
        });
        this.setState({
            teacher,
            selTeacher,
        }, async () => {
            const pici = await this.getPici(selTeacher.teacherId);
            const banji = await this.getClass(pici[0].batchId);
            this.setState({
                pici,
                banji,
                selPici: pici[0].batchId,
                selBanji: banji[0].classId,
            }, async () => {
                this.getTest();
            })
        })
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

    /** 获取批次列表 */
    async getPici(teacherId: any) {
        let res = await get({
            url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}`,
        });
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }

    /** 获取班级列表 */
    async getClass(pici: any) {
        const { selTeacher } = this.state;
        let res = await get({
            url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${pici}&pageNo=1&pageSize=99999`,
        });
        const banji = res?.data?.classList ?? [];
        banji.unshift({
            classCode: '',
            classId: 0,
            createDate: '',
            describe: '全部',
            studentCount: 0,
        });
        return banji;
    }

    /** 更换批次列表 */
    async handlePiCi(val: any) {
        let res = await this.getClass(val);
        let selBanji = res[1] ? res[1].classId : 0;
        if(!val){
            selBanji = 0
        }
        this.setState({
            selPici: val,
            banji: res,
            selBanji,
        }, async () => {
            this.handleBanji(selBanji);
        });
    }

    /** 更换班级列表 */
    async handleBanji(val: any) {
        this.setState({
            selBanji: val,
        }, async () => {
            this.getTest();
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

    /** 获取成绩列表 */
    async getTest() {
        const { pageNo, query, sortKey, sort, examId, selPici, selBanji } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/list?pageSize=20&pageNo=${pageNo}&examId=${examId}&batchId=${selPici}&classId=${selBanji}&query=${query}&sortKey=${sortKey}&sort=${sort}`,
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
        const { examId, testPaperName, selPici, selBanji } = this.state;
        sessionStorage.setItem('examId', examId || '');
        sessionStorage.setItem('questionPaperName', testPaperName || '');
        sessionStorage.setItem('pici', selPici || '');
        sessionStorage.setItem('banji', selBanji || '');
        window.location.href = `${window.location.pathname}#/app/test/testRank/mistakeRank`;
    }

    render() {
        const { columns1, data1, pageNo, routes, totalCount, query, pici, selPici, banji, selBanji } = this.state;
        return (
            <div className="stu-rank">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">成绩排行</div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>
                            <span className="span">学员批次:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={selPici || (pici[0] && (pici[0] as any).describe) || '请选择'}
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
                                style={{ width: 180 }}
                                value={selBanji || (banji[0] && (banji[0] as any).describe) || '请选择'}
                                onChange={this.handleBanji.bind(this)}
                            >
                                {banji.map((item: any) => (
                                    <Option key={item.classId} value={item.classId}>
                                        {item.describe}
                                    </Option>
                                ))}
                            </Select>
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
