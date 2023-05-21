import React from 'react';
import { Row, Col, Tabs, DatePicker, Table, Select, Pagination } from 'antd';
import '../../style/pageStyle/Ranks.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class Ranks extends React.Component {
    state = {
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
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
                title: '大考成绩(平均)',
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

                        return parseInt(a.studyTime) - parseInt(b.studyTime);
                    },
                    multiple: 2,
                },
            },
            {
                title: '累计背词数(累计)',
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
        const pici = await this.getPici();
        const banji = await this.getClass(pici[0].batchId || 0);
        this.setState({
            pici,
            banji,
            selPici: pici[0].batchId,
            selBanji: banji[0].classId,
        });
    }

    async getPici() {
        let res = await get({ url: baseUrl + '/api/v1/structure/batch/list' });
        return res?.data || [];
    }
    async getClass(pici: any) {
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?batchId=${pici}&category=sc` });
        let rankList = await this.getRank(
            pici || 0,
            res?.data[0] ? res?.data[0].classId : 0
        );
        console.log(res);
        return res?.data || [];
    }
    async getRank(pici: any, classid: any) {
        const { evaluation, wordsCount, studyTime, passRate, pageNo, sptPassRate } = this.state;
        let res = await get({
            url:
                baseUrl +
                `/api/v1/semester-score/list?semesterId=${pici}&classId=${classid}&score=${evaluation}&wordsCount=${wordsCount}&studyTime=${studyTime}&stageTestPassRate=${sptPassRate}&testPassRate=${passRate}&pageNo=${pageNo}&pageSize=10`,
        });
        console.log(99999, res.data.semesterScoreList);
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
            allCount: res.data.totalPage,
        });
        return res.data || [];
    }

    async handlePiCi(val: any) {
        let res = await this.getClass(val);
        this.setState({
            selPici: val,
            banji: res,
            selBanji: res[0] ? res[0].classId : 0,
            pageNo: 1,
        });
        console.log(val);
    }
    async handleBanji(val: any) {
        const { selPici } = this.state;
        this.setState(
            {
                selBanji: val,
                pageNo: 1,
            },
            async () => {
                let rankList = await this.getRank(selPici, val);
                console.log(val);
            }
        );
    }
    nowPagChange(val: any) {
        let { selPici, selBanji } = this.state;
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                const ranklist = await this.getRank(selPici, selBanji);
            }
        );
    }

    render() {
        const { pici, selPici, banji, selBanji, columns1, data1, pageNo, allCount } = this.state;
        return (
            <div className="rank-wrapper">
                <div className="header">
                    <div className="fir">排行榜</div>
                    <div className="sec">排行榜</div>
                </div>
                <div className="body">
                    <div className="sec">
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
                            defaultPageSize={10}
                            current={pageNo}
                            total={allCount * 10}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Ranks;
