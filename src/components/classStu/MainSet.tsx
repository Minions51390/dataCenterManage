import React from 'react';
// import { Row, Col, Tabs, DatePicker, Table } from 'antd';
// import moment from 'moment';
import { PageHeader, Radio, Select, Button, Tooltip } from 'antd';
import '../../style/pageStyle/MainSet.less';
import { get, baseUrl } from '../../service/tools';
import axios from 'axios';
const { Option } = Select;

function GetRequest() {
    const url = `?${window.location.href.split('?')[1]}`; //获取url中"?"符后的字串
    let theRequest: any = new Object();
    if (url.indexOf("?") != -1) {
       let str = url.substr(1);
       let strs = str.split("&");
       for(let i = 0; i < strs.length; i ++) {
          theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
       }
    }
    return theRequest;
}

const content1 = (
    <div className="popColor">
      <div>学生自定义：学生可以自行选择每日背词数</div>
      <div>教师设置：由教师统一设置每日背词数，学生无法修改</div>
    </div>
);
const content2 = (
    <div className="popColor">
      <div>开启选词：学生可以自行选择生疏单词学习，提高学习效率。</div>
      <div>不开启选词：学生将学习词库内全部单词。</div>
    </div>
);
const content3 = (
    <div className="popColor">
      <div>选择该班级学员将要学习的词库</div>
    </div>
);
const content4 = (
    <div className="popColor">
      <div>选择该班级学员日常测验题型</div>
    </div>
);
const content5 = (
    <div className="popColor">
      <div>大考将按词库单词顺序依次将单词加入大考测试词库。</div>
      <div>开启大考后，所填考试词数，为本次大考所考词数；如第一次大考则从词库内第一个单词计数。</div>
      <div>若非第一次大考，则从上次大考最后一个词的后一个词开始计数，以此类推。</div>
    </div>
);

class MainSet extends React.Component {
    state = {
        classId: '',
        wordType: 1,
        wordCount: [9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60],
        wordVal: 9,
        startType: 'arbitrarily',
        wordDb: [],
        dbVal: '',
        dbName: '',
        littleType: '',
        bigType: '',
        specialTestDate: '',
        firState: 0,
        secState: 0,
        reciteSetting: false,
        routes: [
            {
                path: '/app/class/main',
                breadcrumbName: '班级和学员管理',
            },
            {
                path: `/class?classId=${GetRequest()['classId']}`,
                breadcrumbName: `${sessionStorage.getItem('className') || '新建班级'}`,
            },
            {
                path: '/set',
                breadcrumbName: '设置学习任务',
            },
        ]
    };
    async componentWillMount() {
        const classId = window.location.href.split('=')[1];
        await this.getKu();
        let res = await this.getSetInfo(classId);
        let dbName = ''
        
        const {wordDb} = this.state
        wordDb.forEach((val: any) => {
            if (val.dictionaryId === res.data.dictionaryId){
                dbName = val.dictionaryName;
                // console.log('ssss', dbName)
            }
        });

        this.setState({
            firState: res.data.reciteSetting ? 1 : 0,
            startType: res.data.choiceWordMethod || 'arbitrarily',
            wordVal: +res.data.dailyReciteCount || 9,
            dbVal: res.data.dictionaryId,
            dbName: dbName,
            littleType: res.data.testType,
            bigType: res.data.specialTest,
            specialTestDate: res.data.specialTestDate
        });
        this.setState({
            classId
        });
    }
    async getSetInfo(id: any) {
        let res = await get({url: baseUrl + `/manage/class/task?classId=${id}`});
        console.log(+res.data.dailyReciteCount);
        return res;
    }
    async getKu() {
        let res = await get({url: baseUrl + '/api/dictionary/info'});
        this.setState({
            wordDb: res.data,
            // dbName: res.data[0].dictionaryName,
            // dbVal: res.data[0].dictionaryId,
        })
        console.log(res);
    }
    setSet() {
        const {startType, wordVal, dbVal, classId} = this.state;
        console.log('liushufang', dbVal, +dbVal)
        axios.patch(baseUrl + '/manage/class/task/recite', {
            dailyReciteCount: + wordVal,
            choiceWordMethod: startType,
            dictionary: +dbVal,
            classId: +classId
        }).then(res => {
            console.log(res);
        });
    }
    setTest() {
        const {littleType, bigType, classId} = this.state;
        axios.patch(baseUrl + '/manage/class/task/test', {
            testType: littleType,
            specialTest: bigType,
            classId: +classId
        }).then(res => {
            console.log(res);
        });
    }
    onWordTypeChange(value: any) {
        this.setState({
            wordType: value.target.value
        });
        console.log(value);
    }
    onStartTypeChange(value: any) {
        this.setState({
            startType: value.target.value
        });
        console.log(value);
    }
    onLittleTypeChange(value: any) {
        this.setState({
            littleType: value.target.value
        });
        console.log(value);
    }
    onBigTypeChange(value: any) {
        this.setState({
            bigType: value.target.value
        });
        console.log(value);
    }
    handleWordCount(value: any) {
        console.log(value);
        this.setState({
            wordVal: value
        });
    }
    handleWordDb(value: any) {
        console.log(value);
        const {wordDb} = this.state;
        let dbName = '';
        wordDb.map((val: any) => {
            if (val.dictionaryId === value){
                dbName = val.dictionaryName;
            }
            return '';
        });
        console.log(dbName);
        this.setState({
            dbVal: value,
            dbName
        });
    }
    saveFir() {
        this.setState({
            firState: 1
        });
        this.setSet();
    }
    async resetFir() {
        const {classId} = this.state;
        let res = await this.getSetInfo(classId);
        this.setState({
            startType: res.data.choiceWordMethod,
            wordVal: +res.data.dailyReciteCount,
            dbVal: res.data.dictionaryId
        });
        this.getKu();
    }
    saveSec() {
        this.setState({
            secState: 1
        });
        this.setTest();
    }
    async resetSec() {
        const {classId} = this.state;
        let res = await this.getSetInfo(classId);
        this.setState({
            littleType: res.data.testType,
            bigType: res.data.specialTest,
            specialTestDate: res.data.specialTestDate
        });
    }

    render() {
        const {wordType, wordCount, startType, wordDb, dbName, littleType, bigType, wordVal, dbVal, firState, secState, routes} = this.state;
        return (
            <div className="main-set">
                <div className="title-area">
                    <PageHeader className="site-page-header" title="" breadcrumb={{ routes }} />
                    <div className="fir-line">
                        <div className="div">设置学习任务</div>
                    </div>
                </div>
                <div className="fir-de-area">
                    <div className="fir-line">
                        <div className="left">
                            背词设置
                        </div>
                        <div className="right">
                            <div>
                                i
                            </div>
                            <div>
                                背词设置内各选项只能修改一次；保存设置后或学员开始背词后无法再做更改。
                            </div>
                        </div>
                    </div>
                    <div className="sec-line">
                        <div className="fir">
                            <div>
                                每日背词数
                            </div>
                            <Tooltip title={content1} trigger="hover" placement="topLeft" color="rgba(0, 0, 0, 0.7)" overlayStyle={{minWidth: '368px'}}>
                                <div>
                                    i
                                </div>
                            </Tooltip>
                        </div>
                        {
                            !firState ? 
                            (
                                <div className="sec">
                                    {/* <Radio.Group onChange={this.onWordTypeChange.bind(this)} value={wordType}>
                                        <Radio value={1}>学生自定义</Radio>
                                        <Radio value={2}>教师设置</Radio>
                                    </Radio.Group> */}
                                    <span style={{'marginRight': '12px'}}>教师设置</span>
                                    <Select
                                        defaultValue={wordVal}
                                        value={wordVal}
                                        style={{ width: 240 }}
                                        onChange={this.handleWordCount.bind(this)}
                                    >
                                        {wordCount.map((item) => (
                                            <Option key={item} value={item}>
                                                {item}
                                            </Option>
                                        ))}
                                    </Select>
                                    <div className="div">
                                        (推荐每日背词数为9~21个)
                                    </div>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">教师设置 {` 背词数: ${wordVal} 个`}</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="thr-line">
                        <div className="fir">
                            <div>
                                是否开启选词
                            </div>
                            <Tooltip title={content2} trigger="hover" placement="topLeft" color="rgba(0, 0, 0, 0.7)" overlayStyle={{minWidth: '410px'}}>
                                <div>
                                    i
                                </div>
                            </Tooltip>
                        </div>
                        {
                            !firState ? 
                            (
                                <div className="sec">
                                    <Radio.Group onChange={this.onStartTypeChange.bind(this)} value={startType} defaultValue='arbitrarily'>
                                        <Radio value={'arbitrarily'}>是</Radio>
                                        <Radio value={'noChoice'}>否</Radio>
                                    </Radio.Group>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">{startType === 'arbitrarily' ? '是' : '否'}</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="four-line">
                        <div className="fir">
                            <div>
                                词库设置
                            </div>
                            <Tooltip title={content3} trigger="hover" placement="topLeft" color="rgba(0, 0, 0, 0.7)" overlayStyle={{minWidth: '228px'}}>
                                <div>
                                    i
                                </div>
                            </Tooltip>
                        </div>
                        {
                            !firState ? 
                            (
                                <div className="sec">
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
                                    </Select>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        当前词库: <div className="state-co">{dbName}</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    {
                        !firState ? 
                        (
                            <div className="last-line">
                                <div className="div1">
                                    <Button block onClick={this.resetFir.bind(this)}>复原</Button>
                                </div>
                                <Button type="primary" onClick={this.saveFir.bind(this)}>保存设置</Button>
                            </div>
                        ) : 
                        <div />
                    }
                </div>
                <div className="sec-de-area">
                    <div className="fir-line">
                        <div className="left">
                            测试设置
                        </div>
                    </div>
                    <div className="sec-line">
                        <div className="fir">
                            <div>
                                单元测试题型设置
                            </div>
                            <Tooltip title={content4} trigger="hover" placement="topLeft" color="rgba(0, 0, 0, 0.7)" overlayStyle={{minWidth: '214px'}}>
                                <div>
                                    i
                                </div>
                            </Tooltip>
                        </div>
                        {
                            !secState ? 
                            (
                                <div className="sec">
                                    <Radio.Group onChange={this.onLittleTypeChange.bind(this)} value={littleType}>
                                        <Radio value={'ch-to-en'}>展示中文释义选择英文</Radio>
                                        <Radio value={'en-to-ch'}>展示英文选择中文释义</Radio>
                                        <Radio value={'completion'}>填空</Radio>
                                        <Radio value={'random'}>随机</Radio>
                                    </Radio.Group>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">{
                                            littleType === 'ch-to-en' ? 
                                            '展示中文释义选择英文' : 
                                            littleType === 'en-to-ch' ?
                                            '展示英文选择中文释义' :
                                            littleType === 'completion' ? 
                                            '填空' :
                                            '随机'}</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="thr-line">
                        <div className="fir">
                            <div>
                                大考设置
                            </div>
                            <Tooltip title={content5} trigger="hover" placement="topLeft" color="rgba(0, 0, 0, 0.7)" overlayStyle={{minWidth: '620px'}}>
                                <div>
                                    i
                                </div>
                            </Tooltip>
                        </div>
                        {
                            !secState ? 
                            (
                                <div className="sec">
                                    <Radio.Group onChange={this.onBigTypeChange.bind(this)} value={bigType}>
                                        <Radio value={"off"}>暂不开启</Radio>
                                        <Radio value={"on"}>开启</Radio>
                                    </Radio.Group>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">{bigType === "off" ? '暂不开启' : '开启'}</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="last-line">
                        <div className="div1">
                            <Button block onClick={this.resetSec.bind(this)}>复原</Button>
                        </div>
                        <Button type="primary" onClick={this.saveSec.bind(this)}>保存设置</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default MainSet;
