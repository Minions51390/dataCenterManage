import React from 'react';
import { Row, Col, Tabs, DatePicker, Table, Select, Pagination } from 'antd';
import '../../style/pageStyle/ErrorBook.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class ErrorBook extends React.Component {
    state = {
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
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
        this.setState(
            {
                wordDb: res,
                dbVal: res[0].dictionaryId,
            },
            async () => {
                const pici = await this.getPici();
                const banji = await this.getClass(pici[0].batchId || 0);
                this.setState({
                    pici,
                    banji,
                    selPici: pici[0].batchId,
                    selBanji: banji[0].classId,
                });
            }
        );
    }
    async getKu() {
        let res = await get({ url: baseUrl + '/api/dictionary/info' });
        return res.data || [];
    }
    async getPici() {
        let res = await get({ url: baseUrl + '/api/v1/structure/batch/list' });
        return res.data.detail || [];
    }
    async getClass(pici: any) {
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?batchId=${pici}&category=all` });
        let rankList = await this.getRank(
            pici || 0,
            res.data.detail[0] ? res.data.detail[0].classId : 0
        );
        console.log(res);
        return res.data.detail || [];
    }
    async getRank(pici: any, classid: any) {
        const { pageNo, dbVal } = this.state;
        // let res = await get({url: baseUrl + `/census/wrongBook?dictionaryId=${dbVal}&batchId=${pici}&classId=${classid}&pageNo=${pageNo}&pageSize=20`});
        let res = await get({
            url:
                baseUrl +
                `/census/wrongBook?batchId=${pici}&classId=${classid}&pageNo=${pageNo}&pageSize=20`,
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

    async handlePiCi(val: any) {
        let res = await this.getClass(val);
        this.setState({
            selPici: val,
            banji: res,
            selBanji: res[0] ? res[0].classId : 0,
        });
        console.log(val);
    }
    async handleBanji(val: any) {
        const { selPici } = this.state;
        this.setState({
            selBanji: val,
        });
        let rankList = await this.getRank(selPici, val);
        console.log(val);
    }
    async handleWordDb(value: any) {
        let { selPici, selBanji } = this.state;
        this.setState(
            {
                dbVal: value,
            },
            async () => {
                const ranklist = await this.getRank(selPici, selBanji);
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
        const {
            pici,
            selPici,
            banji,
            selBanji,
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
