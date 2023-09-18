import React from 'react';
import { Row, Col, Tabs, DatePicker, Table, Select, Pagination } from 'antd';
import '../../style/pageStyle/Ranks.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class Ranks extends React.Component {
    state = {
        teacher: [],
        selTeacher: {
            teacherId: 0,
            realName: '',
        },
        pici: [],
        selPici: 0,
        banji: [],
        selBanji: '',
        semester: [],
        selSemester: [],
        evaluation: 'desc',
        wordsCount: 'desc',
        studyTime: 'desc',
        passRate: 'desc',
        sptPassRate: 'desc',
        pageNo: 1,
        allCount: 1,
        columns1: [
            {
                title: '排名',
                dataIndex: 'rank',
                key: 'rank',
            },
            {
                title: '姓名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '综合评分(平均)',
                dataIndex: 'evaluation',
                key: 'evaluation',
                sorter: {
                    compare: (a: any, b: any) => {
                        console.log(a, b);
                        return a.evaluation - b.evaluation;
                    },
                    multiple: 4,
                },
            },
            {
                title: '阶段考成绩(平均)',
                dataIndex: 'sptPassRate',
                key: 'sptPassRate',
                sorter: {
                    compare: (a: any, b: any) => {
                        console.log(a, b);
                        return parseFloat(a.sptPassRate) - parseFloat(b.sptPassRate);
                    },
                    multiple: 3,
                },
            },
            {
                title: '小测成绩(平均)',
                dataIndex: 'passRate',
                key: 'passRate',
                sorter: {
                    compare: (a: any, b: any) => {
                        console.log(a, b);

                        return parseFloat(a.passRate) - parseFloat(b.passRate);
                    },
                    multiple: 3,
                },
            },
            {
                title: '学习时长(累计)',
                dataIndex: 'studyTime',
                key: 'studyTime',
                sorter: {
                    compare: (a: any, b: any) => {
                        console.log(a, b);
                        return parseFloat(a.studyTime) - parseFloat(b.studyTime);
                    },
                    multiple: 2,
                },
            },
            {
                title: '累计背词数',
                dataIndex: 'wordsCount',
                key: 'wordsCount',
                sorter: {
                    compare: (a: any, b: any) => {
                        console.log(a, b);

                        return a.wordsCount - b.wordsCount;
                    },
                    multiple: 1,
                },
            },
            {
                title: '进入班级天数',
                dataIndex: 'registerDays',
                key: 'registerDays',
            },
            {
                title: '平台的学习打卡天数(只有背词算)',
                dataIndex: 'punchCount',
                key: 'punchCount',
            },
        ],
        data1: [],
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        this.setState({
            selTeacher
        }, async () => {
            const pici = await this.getPici(selTeacher.teacherId);
            const banji = await this.getClass(pici[0].batchId || 0);
            const semester = await this.getSemester(banji[0].classId || 0);
            // const selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : [];
            this.setState({
                teacher,
                pici,
                banji,
                semester,
                selPici: pici[0].batchId,
                selBanji: banji[0].classId,
                selSemester: [0],
            }, async () => {
                this.getRank();
            });
        })
    }

    /** 获取教师列表 */
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list`});
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }

    async getPici(teacherId:any) {
        let res = await get({ url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}`});
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }
    async getClass(pici: any) {
        const {selTeacher} = this.state
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${pici}&pageNo=1&pageSize=99999`});
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
        const {selPici, selTeacher} = this.state
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${classId}`
        })
        const semester = res?.data || [];
        semester.unshift({
            isCurrent: false,
            semesterId: 0,
            semesterName: '全部',
        });
        return semester;
    }
    async getRank() {
        const { evaluation, wordsCount, studyTime, passRate, pageNo, sptPassRate, selTeacher, selPici, selBanji, selSemester } = this.state;
        let res = await get({
            url:
                baseUrl +
                `/api/v1/semester-score/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${selBanji}&semesters=${JSON.stringify(selSemester)}&score=${evaluation}&wordsCount=${wordsCount}&studyTime=${studyTime}&stageTestPassRate=${sptPassRate}&testPassRate=${passRate}&pageNo=${pageNo}&pageSize=10`,
        });
        let data1 = res.data.semesterScoreList
            ? res.data.semesterScoreList
			.slice(0, 10).map((val: any, index: number) => {
                  return {
                      rank: val.rank,
                      name: val.name,
                      evaluation: val.score,
                      wordsCount: val.wordsCount,
                      studyTime: `${val.studyTime}小时`,
                      passRate: `${val.testTestPassRate.toFixed(2)}%`,
                      sptPassRate: `${val.stageTestPassRate.toFixed(2)}%`,
                      registerDays: val.registerDays,
                      punchCount: val.punchCount,
                  };
              })
            : [];
        this.setState({
            data1,
            allCount: res.data.totalCount,
        });
        return res.data || [];
    }
    // 教师切换
    async handleTeacher(val: any){
        const { teacher } = this.state;
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === val
        });
        const res = await this.getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        this.setState({
            selTeacher,
            pici: res,
        }, async () => {
            this.handlePiCi(pici);
        });
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
            pageNo: 1,
        }, async () => {
            this.handleBanji(selBanji)
        });
        
    }
    async handleBanji(val: any) {
        const semester = await this.getSemester(val);
        let selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : []
        if(!val){
            selSemester = [0]
        }
        this.setState(
            {
                selBanji: val,
                pageNo: 1,
                semester,
                selSemester,
            }, async () => {
                this.handleSemester(selSemester);
            }
        );
    }
    async handleSemester(val: any) {
        this.setState({
            selSemester: val,
        }, async () => {
            this.getRank();
        });
    }
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                this.getRank();
            }
        );
    }

    render() {
        const { teacher, pici, selPici, banji, selBanji, semester, selTeacher, selSemester, columns1, data1, pageNo, allCount } = this.state;
        return (
            <div className="rank-wrapper">
                <div className="header">
                    <div className="fir">排行榜</div>
                    <div className="sec">排行榜</div>
                </div>
                <div className="body">
                    <div className="sec">
                        <span className="span">执教教师:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selTeacher?.realName || (teacher[0] && (teacher[0] as any).realName) || '请选择'}
                            onChange={this.handleTeacher.bind(this)}
                        >
                            {teacher.map((item: any) => (
                                <Option key={item.teacherId} value={item.teacherId}>
                                    {item.realName}
                                </Option>
                            ))}
                        </Select>
                        <span className="span2">学员批次:</span>
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
                        <span className="span1">班级:</span>
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
                        <span className="span1">阶段:</span>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: 260 }}
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
                        />
                    </div>
                    <div className={allCount > 10 ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            defaultPageSize={10}
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

export default Ranks;
