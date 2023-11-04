import React from 'react';
import { PageHeader, Input, Button, Table, Select, Pagination } from 'antd';
import '../../style/pageStyle/ExamRank.less';
import { get, post, baseUrl } from '../../service/tools';
import { getQueryString } from '../../utils';
const { Option } = Select;
class examRank extends React.Component {
    state = {
        routes: [
            {
                path: '/app/writing/writingExam',
                breadcrumbName: '已发布作文',
            },
            {
                path: '/app/writing/examRank',
                breadcrumbName: `成绩排行`,
            },
        ],
        examId: '',
        // 筛选
        query: '',
        teacherId: Number(localStorage.getItem("classTeacherId")),
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        // 列表
        pageNo: 1,
        pageSize: 20,
        allCount: 1,
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '批次',
                dataIndex: 'batchName',
                key: 'batchName',
            },
            {
                title: '班级',
                dataIndex: 'className',
                key: 'className',
            },
            {
                title: '阶段',
                key: 'semesterName',
                dataIndex: 'semesterName',
            },
            {
                title: '学生姓名',
                key: 'stuName',
                dataIndex: 'stuName',
            },
            {
                title: '成绩',
                key: 'score',
                render: (text: any, record: any, index: number) => <div>{text.score === -1 ? '未考试' : text.score}</div>,
            },
            {
                title: '班级',
                dataIndex: 'className',
                key: 'className',
            },
            {
                title: '阶段',
                dataIndex: 'semesterName',
                key: 'semesterName',
            },
            {
                title: '操作',
                render: (text: any) => (
                    <div className="edit">
                        <div className={text.score > 0 ? "rank" : "rank-disable rank"} onClick={this.handlePaperClick.bind(this, text)}>查看卷面</div>
                    </div>
                ),
            },
        ],
        data1: [],
        sort: '',
        sortKey: '',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const examId = decodeURI(getQueryString().examId || '');
        const {teacherId} = this.state;
        this.setState(
            {
                examId,
            },
            async () => {
                const pici = await this.getPici(teacherId);
                const banji = await this.getClass(pici[0].batchId || 0);
                this.setState({
                    pici,
                    banji,
                    selPici: pici[0].batchId,
                    selBanji: banji[0].classId,
                }, async () => {
                    const semester = await this.getSemester(banji[0].classId || 0);
                    const selSemester = [0]
                    this.setState({
                        semester,
                        selSemester,
                    }, () => {
                        this.getRankList()
                    });
                })
            }
        );
    }
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list`});
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }
    async getPici(teacherId: any) {
        const res = await get({ url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}`});
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }
    async getClass(pici: any) {
        const { teacherId } = this.state;
        console.log('teacherId', teacherId)
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?teacherId=${teacherId}&batchId=${pici}&pageNo=1&pageSize=99999` });
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
    async getSemester(classId: any){
        const {selPici, teacherId} = this.state
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?teacherId=${teacherId}&batchId=${selPici}&classId=${classId}`
        })
        const semester = res?.data || [];
        semester.unshift({
            isCurrent: false,
            semesterId: 0,
            semesterName: '全部',
        });
        return semester;
    }
    async getRankList(){
        const {query, examId, teacherId, selPici, selBanji, pageNo, pageSize} = this.state;
        const res = await get({
            url: baseUrl + `/api/v1/writing-exam/result/list?examId=${examId}&teacherId=${teacherId}&batchId=${selPici}&classId=${selBanji}&pageNo=${pageNo}&pageSize=${pageSize}&query=${query}`
        })
        this.setState({
            data1: res?.data?.data ?? [],
            allCount: res?.data?.totalCount,
        }) 
    }
    async handlePiCi(val: any) {
        const res = await this.getClass(val);
        let selBanji = res[1] ? res[1].classId : 0;
        if(!val){
            selBanji = 0
        }
        this.setState({
            selPici: val,
            banji: res,
            selBanji,
        }, async () => {
            this.handleBanji(selBanji)
        });
    }
    async handleBanji(val: any) {
        this.setState({
            selBanji: val,
        }, async () => {
            this.getRankList()
        });
    }
    // 搜索类型切换
    handleQueryType(val:any){
        this.setState({
            queryType: val
        })
    }
    // 搜索关键字修改
    searchQueryChange(event:any){
        this.setState({
            query: event.target.value
        })
    }
    // 搜索
    clickSearch(val:any){
        this.getRankList()
    }
    handlePaperClick(val:any){
        if(val.score >= 0){
            window.location.href = `${window.location.pathname}#/app/writing/examDetail?paperId=${val.paperId}`;
        }
    }
    //页码操作
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            () => {
                this.getRankList();
            }
        );
    }
    render() {
        const {
            routes,
            pici,
            selPici,
            banji,
            selBanji,
            columns1,
            data1,
            pageNo,
            allCount,
            query,
        } = this.state;
        return (
            <div className="exam-rank-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                    <div className="text">成绩排行</div>
                </div>
                </div>
                <div className="body">
                    <div className="sec">
                        <div className="sec-box">
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
                        </div>
                        <div className="sec-box">
                            <span className="span">班级:</span>
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
                        </div>
                        <div className="sec-search">
                            <Input.Group compact>
                                <Input
                                    style={{ width: '240px' }}
                                    placeholder="待输入"
                                    value={query}
                                    onChange={this.searchQueryChange.bind(this)}
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
                            total={allCount}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default examRank;
