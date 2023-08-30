import React from 'react';
import { Table, Pagination, Input, Button, message, Select, Popconfirm } from 'antd';
import '../../style/pageStyle/TestRank.less';
import copy from 'clipboard-copy';
import { get, del, baseUrl } from '../../service/tools';
import { getQueryString } from '../../utils';
const { Option } = Select;

const mockExamList = [
    {
        examId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examName: '1',
        questionPaperName: '初三下册第一次测验',
        creator: '大橙子',
        questionPaperId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        semesterName: '123',
        examTime: '2022-03-19 17:56:43',
        status: 1,
    },
    {
        examId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examName: '2',
        questionPaperName: '初三下册第一次测验',
        creator: '大橙子',
        questionPaperId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        semesterName: '123',
        examTime: '2022-03-19 17:56:43',
        status: 2,
    },
    {
        examId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examName: '3',
        questionPaperName: '初三下册第一次测验',
        creator: '大橙子',
        questionPaperId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        semesterName: '123',
        examTime: '2022-03-19 17:56:43',
        status: 2,
    },
];

const statusTextList = ['全部', '待考试', '已考'];

class TestRank extends React.Component {
    state = {
        pageNo: 1,
        totalCount: 1,
        teacher: [],
        selTeacher: {
            teacherId: '',
            realName: '',
        },
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        semester: [],
        selSemester: [],
        query: '',
        queryType: 'examName',
        queryTypeList: [
            {
                type: 'examName',
                name: '考试名称',
            },
            {
                type: 'questionPaperName',
                name: '试卷名称',
            },
            // {
            //     type: 'creator',
            //     name: '创建人',
            // },
            {
                type: 'questionPaperId',
                name: '考试ID',
            },
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
                title: '考试名称',
                dataIndex: 'examName',
                key: 'examName',
            },
            {
                title: '试卷名称',
                dataIndex: 'questionPaperName',
                key: 'questionPaperName',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
                sorter: true,
            },
            {
                title: '试卷ID',
                key: 'questionPaperId',
                render: (text: any) => (
                    <div className="edit">
                        <div
                            className="copy"
                            onClick={this.copyIdFn.bind(this, text.questionPaperId)}
                        >
                            <div>{text.questionPaperId}</div>
                        </div>
                    </div>
                ),
            },
            {
                title: '阶段',
                dataIndex: 'semesterName',
                key: 'semesterName',
                sorter: true,
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
                render: (text: any) => <div>{statusTextList[text.status]}</div>,
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="edit">
                        {text.status !== 2 ? (
                            <Popconfirm
                                placement="topLeft"
                                title="是否确认删除？删除后无法恢复!"
                                okText="确认"
                                cancelText="取消"
                                onConfirm={this.delExam.bind(this, text.questionPaperId)}
                            >
                                <div className="copy">
                                    <div>删除</div>
                                </div>
                            </Popconfirm>
                        ) : (
                            <div className="gray">删除</div>
                        )}
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
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === Number(localStorage.getItem('classTeacherId'));
        });
        this.setState({
            teacher,
            selTeacher,
            query: decodeURI(getQueryString().examName || ''),
        }, async () => {
            const pici = await this.getPici(selTeacher.teacherId);
            const banji = await this.getClass(pici[0].batchId);
            this.setState({
                pici,
                banji,
                selPici: pici[0].batchId,
                selBanji: banji[0].classId,
            }, async () => {
                const semester = await this.getSemester(banji[0].classId || 0);
                // const selSemester = getQueryString().selSemester ? [Number(getQueryString().selSemester)] : 
                //     semester.length > 0 ? [semester.find((item: any) => item.isCurrent)?.semesterId ?? 0] : [];
                const selSemester = getQueryString().selSemester ? [Number(getQueryString().selSemester)] : [0];
                console.log('selSemester', selSemester)
                this.setState({
                    semester,
                    selSemester,
                }, () => {
                    this.getTest();
                });
            })
        })
    }
    async handleTeacher(val: any) {
        const { teacher } = this.state;
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === val;
        });
        const res = await this.getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        this.setState({
            selTeacher,
            pici: res,
        });
        this.handlePiCi(pici);
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
        const semester = await this.getSemester(val);
        let selSemester =
            semester.length > 0 ? [semester.find((item: any) => item.isCurrent)?.semesterId ?? 0] : [];
        if(!val){
            selSemester = [0]
        }
        this.setState({
            selBanji: val,
            semester,
            selSemester,
        }, async () => {
            this.handleSemester(selSemester);
        });
    }

    /** 更换阶段列表 */
    handleSemester(val: any) {
        console.log('val', val);
        this.setState({
            selSemester: val,
        }, () => {
            this.getTest();
        });
    }

    /** 更换考试状态 */
    handleStatus(val: any) {
        this.setState(
            {
                status: val,
            },
            () => {
                this.getTest();
            }
        );
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
        const { examId, questionPaperName } = text;
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
        sessionStorage.setItem('examId', examId);
        sessionStorage.setItem('questionPaperName', questionPaperName);
        sessionStorage.setItem('pici', piciName);
        sessionStorage.setItem('banji', banjiName);
        window.location.href = `${window.location.pathname}#/app/test/testRank/stuRank`;
    }

    jumpMistake = (text: any) => {
        console.log(text);
        const { examId, questionPaperName } = text;
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
        sessionStorage.setItem('examId', examId);
        sessionStorage.setItem('questionPaperName', questionPaperName);
        sessionStorage.setItem('pici', piciName);
        sessionStorage.setItem('banji', banjiName);
        window.location.href = `${window.location.pathname}#/app/test/testRank/mistakeRank`;
    };

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

    /** 获取阶段列表 */
    async getSemester(classId: any) {
        const {selPici, selTeacher} = this.state
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${classId}`,
        });
        const semester = res?.data || [];
        semester.unshift({
            isCurrent: false,
            semesterId: 0,
            semesterName: '全部',
        });
        return semester;
    }

    /** 获取成绩列表 */
    async getTest() {
        const { pageNo, selTeacher, selPici, selBanji ,selSemester, queryType, query, sortKey, sort, status } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/exam/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${selBanji}&pageSize=20&pageNo=${pageNo}&semesters=${JSON.stringify(
                selSemester
            )}&queryType=${queryType}&query=${query}&sortKey=${sortKey}&sort=${sort}&status=${status}`,
        });
        console.log('------------->', res);
        const examList = res?.data?.examList || mockExamList;
        const totalCount = res?.data?.totalCount;
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
        let res = await del({ url: baseUrl + `/api/exam?examId=${id}` });
        console.log(res);
        this.getTest();
    }

    render() {
        const {
            columns1,
            data1,
            pageNo,
            totalCount,
            teacher,
            selTeacher,
            selPici,
            pici,
            selBanji,
            banji,
            semester,
            selSemester,
            query,
            queryType,
            queryTypeList,
            statusList,
            status,
        } = this.state;
        return (
            <div className="paper-rank">
                <div className="header">
                    <div className="fir">已发布考试/考试成绩</div>
                    <div className="sec">已发布考试/考试成绩</div>
                </div>
                <div className="body">
                    <div className="zero">
                        <div className="left">
                            <Input.Group compact>
                                <Select
                                    defaultValue={queryType}
                                    value={queryType || '请选择'}
                                    onChange={this.handleQueryType.bind(this)}
                                >
                                    {queryTypeList.map((item: any) => (
                                        <Option value={item.type} key={item.classId}>
                                            {item.name}
                                        </Option>
                                    ))}
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
                        <div className="right">
                            <span className="span3">试卷状态:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 140 }}
                                value={
                                    status ||
                                    (statusList[0] && (statusList[0] as any).name) ||
                                    '请选择'
                                }
                                onChange={this.handleStatus.bind(this)}
                            >
                                {statusList.map((item: any) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className="fir">
                        <span className="span">执教教师:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 140 }}
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
                        <span className="span3">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 140 }}
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
                            style={{ width: 140 }}
                            value={selBanji || (banji[0] && (banji[0] as any).describe) || '请选择'}
                            onChange={this.handleBanji.bind(this)}
                        >
                            {banji.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span2">阶段:</span>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: 200 }}
                            value={selSemester}
                            onChange={this.handleSemester.bind(this)}
                        >
                            {semester.map((item: any) => (
                                <Option key={item.semesterId} value={item.semesterId}>
                                    {item.semesterName || item.semesterId}
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
                    <div className={ totalCount / 20 < 1 ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            pageSize={20}
                            current={pageNo}
                            total={totalCount}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default TestRank;
