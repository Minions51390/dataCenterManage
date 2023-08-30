import React from 'react';
import { Row, Col, Tabs, DatePicker, Table, Select, Pagination } from 'antd';
import '../../style/pageStyle/ErrorBook.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class ErrorBook extends React.Component {
    state = {
        teacher: [],
        selTeacher: {
            teacherId: 0,
            realName: '',
        },
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        semester: [],
        selSemester: [],
        pageNo: 1,
        allCount: 1,
        wordDb: [],
        dbVal: '',
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '单词',
                dataIndex: 'en',
                key: 'en',
            },
            {
                title: '中文',
                dataIndex: 'ch',
                key: 'ch',
            },
            {
                title: '音标',
                dataIndex: 'phoneticSymbols',
                key: 'phoneticSymbols',
            },
            {
                title: '出错人次',
                dataIndex: 'wrongCount',
                key: 'wrongCount',
            },
        ],
        data1: [],
        dictionary: '',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        // let userid = await this.login();
        let res = await this.getKu();
        if (!res[0]) {
            return;
        }
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        this.setState(
            {
                wordDb: res,
                dbVal: res[0].dictionaryId,
                teacher,
                selTeacher,
            },
            async () => {
                const pici = await this.getPici(selTeacher.teacherId);
                const banji = await this.getClass(pici[0].batchId || 0);
                this.setState({
                    pici,
                    banji,
                    selPici: pici[0].batchId,
                    selBanji: banji[0].classId,
                }, async () => {
                    const semester = await this.getSemester(banji[0].classId || 0);
                    // const selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : [];
                    const selSemester = [0]
                    this.setState({
                        semester,
                        selSemester,
                    });
                    await this.getRank(JSON.stringify(selSemester));
                })
            }
        );
    }
    async getKu() {
        let res = await get({ url: baseUrl + '/api/v1/material/dictionary/list' });
        return res.data || [];
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
        const { selTeacher } = this.state;
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${pici}&pageNo=1&pageSize=99999` });
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
    async getRank(semesters: any) {
        const {selPici, selTeacher, selBanji} = this.state
        const { pageNo } = this.state;
        let res = await get({
            url:
                baseUrl +
                `/api/v1/wrong-book/?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${selBanji}&semesters=${semesters}&pageNo=${pageNo}&pageSize=20`,
            
        });
        console.log(res);
        let data1 = res.data.detail
            ? res.data.detail.map((val: any, index: number) => {
                  return {
                      key: index + 1,
                      en: val.en,
                      ch: val.ch,
                      phoneticSymbols: val.phoneticSymbols,
                      wrongCount: val.wrongCount,
                  };
              })
            : [];
        let dictionary = res.data.dictionary;
        this.setState({
            data1,
            allCount: res.data.totalPage,
            dictionary: dictionary,
        });
        return res.data || [];
    }
    async handleTeacher (val:any){
        const { teacher } = this.state;
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === val
        });
        const res = await this.getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        this.setState({
            selTeacher,
            pici: res,
        });
        this.handlePiCi(pici);
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
        const semester = await this.getSemester(val);
        let selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : []
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
    async handleSemester(val: any) {
        this.setState({
            selSemester: val,
        });
        await this.getRank(JSON.stringify(val));
    }
    async handleWordDb(value: any) {
        const { selSemester } = this.state;
        this.setState(
            {
                dbVal: value,
            },
            async () => {
                const ranklist = await this.getRank(JSON.stringify(selSemester));
            }
        );
    }
    nowPagChange(val: any) {
        const { selSemester } = this.state;
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                const ranklist = await this.getRank(JSON.stringify(selSemester));
            }
        );
    }

    render() {
        const {
            teacher,
            selTeacher,
            pici,
            selPici,
            banji,
            selBanji,
            semester,
            selSemester,
            columns1,
            data1,
            pageNo,
            allCount,
            wordDb,
            dbVal,
            dictionary,
            
        } = this.state;
        return (
            <div className="rank-wrapper">
                <div className="header">
                    <div className="fir">错词本</div>
                    <div className="sec">错词本</div>
                </div>
                <div className="body">
                    <div className="sec">
                        {/* <span className="span">词库设置:</span>
                        <Select
                            defaultValue={dbVal}
                            value={dbVal || (wordDb[0] && (wordDb[0] as any).dictionaryId) || "请选择"}
                            style={{ width: 240 }}
                            onChange={this.handleWordDb.bind(this)}
                        >
                            {wordDb.map((item: any) => (
                                <Option key={item.dictionaryId} value={item.dictionaryId}>
                                    {item.dictionaryName}
                                </Option>
                            ))}
                        </Select> */}
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
                            style={{ width: 240 }}
                            value={selSemester}
                            onChange={this.handleSemester.bind(this)}
                        >
                            {semester.map((item: any) => (
                                <Option key={item.semesterId} value={item.semesterId}>
                                    {item.semesterName || item.semesterId}
                                </Option>
                            ))}
                        </Select>
                        <span className="span1 span3">{dictionary}</span>
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

export default ErrorBook;
