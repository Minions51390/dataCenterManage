import React from 'react';
import {
    PageHeader,
    Radio,
    Select,
    Button,
    Tooltip,
    DatePicker,
    Space,
    Input,
    message,
    Modal,
    Alert,
} from 'antd';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/MainSet.less';
import { get, post, patch, baseUrl } from '../../service/tools';
import moment from 'moment';
import img from '../../style/imgs/qiyewechat.png';
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

function GetRequest() {
    const url = `?${window.location.href.split('?')[1]}`; //获取url中"?"符后的字串
    let theRequest: any = {};
    if (url.indexOf('?') !== -1) {
        let str = url.substr(1);
        let strs = str.split('&');
        for (let i = 0; i < strs.length; i++) {
            theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
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
        <div>
            开启大考后，所填考试词数，为本次大考所考词数；如第一次大考则从词库内第一个单词计数。
        </div>
        <div>若非第一次大考，则从上次大考最后一个词的后一个词开始计数，以此类推。</div>
    </div>
);

class MainSet extends React.Component {
    state = {
        classId: '',
        wordType: 1,
        wordCount: [9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60],
        wordVal: 0,
        startType: 'arbitrarily',
        wordDb: [],
        dbVal: '',
        dbName: '',
        littleType: '',
        bigType: '',
        bigTime: moment().format(dateFormat),
        bigCount: 0,
        specialTestDate: '',
        firState: 0,
        secState: 0,
        thrState: 0,
        reciteSetting: false,
        paperId: '',
        paperName: '',
        diyTime: moment().format(dateFormat),
        jieduan: [],
        selJieduan: '',
        addJieduanModule: false,
        addCikuModule: false,
        jieduanText: '',
        routes: [
            {
                path: '/app/class/main',
                breadcrumbName: '班级和学员管理',
            },
            {
                path: `/class?classId=${
                    GetRequest()['classId'] || sessionStorage.getItem('classId')
                }`,
                breadcrumbName: `${sessionStorage.getItem('className') || '新建班级'}`,
            },
            {
                path: '/set',
                breadcrumbName: '设置学习任务',
            },
        ],
    };
    async componentWillMount() {
        console.log(this.state.bigTime);
        const classId = window.location.href.split('=')[1] || sessionStorage.getItem('classId');
        await this.getKu();
        const jieduanRes = await this.getJieDuanList(classId);
        const selJieduan = jieduanRes[0]? jieduanRes.find((item:any)=>item.isCurrent)?.semesterId : 0
        console.log('use jieduan', jieduanRes);
        let res = await this.getSetInfo(classId, selJieduan);
        let dbName = '';

        const { wordDb } = this.state;
        wordDb.forEach((val: any) => {
            if (val?.dictionaryId === res?.data?.dictionaryId) {
                dbName = val?.dictionaryName;
                // console.log('ssss', dbName)
            }
        });

        this.setState(
            {
                jieduan: jieduanRes || [],
                selJieduan: selJieduan,
                firState: res?.data?.reciteSetting ? 1 : 0,
                startType: res?.data?.choiceWordsMethod || 'arbitrarily',
                wordVal: res?.data?.reciteVersion ? +res?.data?.reciteVersion : 0,
                dbVal: res?.data?.dictionaryId || 0,
                dbName: dbName || '',
                littleType: res?.data?.wordTestType || '',
                bigType: res?.data?.stageWordsTest || '',
                specialTestDate: res?.data?.specialTestDate || new Date(),
                paperId: res?.data?.specialTestID || 1,
            },
            () => {
                this.getTestData();
            }
        );

        this.setState({
            classId,
        });
    }
    async getJieDuanList(id: any) {
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?classId=${id}`,
        });
        return res?.data;
    }

    async getSetInfo(classId: any, semesterId: any) {
        let res = await get({ url: baseUrl + `/api/v1/structure/semester?classId=${classId}&semesterId=${semesterId}` });
        console.log(999999, res);
        return res;
    }

    async getKu() {
        let res = await get({ url: baseUrl + '/api/v1/material/dictionary/list' });
        this.setState({
            wordDb: res.data,
            // dbName: res.data[0].dictionaryName,
            // dbVal: res.data[0].dictionaryId,
        });
        console.log(res);
    }

    async addXinXueQi() {
        const { jieduanText, classId } = this.state;
        let res = await post({
            url: baseUrl + '/api/v1/structure/semester',
            data: {
                semesterName: jieduanText,
                classId: classId,
            },
        });
        return res;
    }

    setSet() {
        const { startType, wordVal, dbVal, classId, selJieduan } = this.state;
        console.log('this.state', this.state)
        console.log('liushufang', dbVal, +dbVal);
        patch({
            url: baseUrl + '/api/v1/structure/semester/recite',
            data: {
                reciteVersion: +wordVal,
                choiceWordsMethod: startType,
                dictionaryId: +dbVal,
                classId: +classId,
                semesterId: selJieduan,
            },
        }).then((res) => {
            if(res.state === 0){
                message.success('背词设置保存成功!');
            }else{
                message.error(`背词设置保存失败：${res.msg}`);
            }
        });
    }
    setTest() {
        const { littleType, bigType, classId, paperId, diyTime, selJieduan } = this.state;
        let params: any = {};
        if (bigType === 'on') {
            params = {
                wordTestType: littleType || 'random',
                stageWordsTest: bigType || 'off',
                specialTestType: 'customTest',
                specialTestID: paperId,
                specialTestDate: diyTime,
                classId: +classId,
                semesterId: +selJieduan,
            };
        } else {
            params = {
                wordTestType: littleType || 'random',
                stageWordsTest: bigType || 'off',
                classId: +classId,
                semesterId: +selJieduan,
            };
        }
        patch({
            url: baseUrl + '/api/v1/structure/semester/test',
            data: params,
        }).then((res) => {
            console.log(res);
        });
    }
    onWordTypeChange(value: any) {
        this.setState({
            wordType: value.target.value,
        });
        console.log(value);
    }
    onStartTypeChange(value: any) {
        this.setState({
            startType: value.target.value,
        });
        console.log(value);
    }
    onLittleTypeChange(value: any) {
        this.setState({
            littleType: value.target.value,
        });
        console.log(value);
    }

    onBigTypeChange(value: any) {
        this.setState({
            bigType: value.target.value,
        });
        console.log(value);
    }

    onBigTimeChange(date: any, dateString: any) {
        this.setState({
            bigTime: dateString,
        });
        console.log(date, dateString);
    }

    onBigCountChange(event: any) {
        this.setState({
            bigCount: event.target.value,
        });
    }

    onJieduanTextChange(event: any) {
        this.setState({
            jieduanText: event.target.value,
        });
    }

    handleWordCount(value: any) {
        console.log(value);
        this.setState({
            wordVal: value,
        });
    }

    onTeacherWordChange(event: any) {
        this.setState({
            wordVal: event.target.value,
        });
    }

    handleWordDb(value: any) {
        console.log(value);
        const { wordDb } = this.state;
        let dbName = '';
        wordDb.map((val: any) => {
            if (val.dictionaryId === value) {
                dbName = val.dictionaryName;
            }
            return '';
        });
        console.log(dbName);
        this.setState({
            dbVal: value,
            dbName,
        });
    }

    saveFir() {
        this.setState({
            firState: 1,
        });
        const { wordDb, dbVal } = this.state;
        let dbName = '';
        let newdbVal = +dbVal ? +dbVal : wordDb[0] && (wordDb[0] as any).dictionaryId;

        wordDb.map((val: any) => {
            if (val.dictionaryId === newdbVal) {
                dbName = val.dictionaryName;
            }
            return '';
        });
        console.log(dbName);
        this.setState({
            dbVal: newdbVal,
            dbName,
        });
        this.setSet();
    }

    async resetFir() {
        const { classId, selJieduan } = this.state;
        let res = await this.getSetInfo(classId, selJieduan);
        this.setState(
            {
                startType: res?.data?.choiceWordsMethod || 'noChoice',
                wordVal: res?.data?.dailyReciteCount ? +res?.data?.dailyReciteCount : 0,
                dbVal: res?.data?.dictionaryId || 3,
                paperId: res?.data?.specialTestID || '',
                diyTime: res?.data?.specialTestDate || new Date(),
            },
            () => {
                this.getTestData();
            }
        );
        this.getKu();
    }
    saveSec() {
        this.setState({
            secState: 1,
        });
        this.setTest();
    }
    async resetSec() {
        const { classId, selJieduan } = this.state;
        let res = await this.getSetInfo(classId, selJieduan);
        this.setState({
            secState: 0,
            littleType: res.data.wordTestType,
            bigType: res.data.stageWordsTest,
            specialTestDate: res.data.specialTestDate,
            paperId: res?.data?.specialTestID,
        });
    }
    saveThr() {
        this.setState({
            thrState: 1,
        });
        this.diyExam();
    }
    async resetThr() {
        const { classId, selJieduan } = this.state;
        let res = await this.getSetInfo(classId, selJieduan);
        this.setState({
            thrState: 0,
            paperId: res?.data?.specialTestID,
        });
    }

    onPaperIdChange(event: any) {
        this.setState(
            {
                paperId: event.target.value,
            },
            () => {
                this.getTestData();
            }
        );
    }

    /** 单个试卷信息 */
    async getTestData() {
        const { paperId } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-paper/?questionPaperId=${paperId}`,
        });
        console.log(res);
        this.setState({
            paperName: res?.data?.testPaperName,
        });
    }

    onDiyTimeChange(date: any, dateString: any) {
        this.setState({
            diyTime: dateString,
        });
        console.log(date, dateString);
    }

    async diyExam() {
        const { paperId, classId, diyTime } = this.state;
        let res = await post({
            url: baseUrl + '/api/exam',
            data: {
                classID: +classId,
                testPaperID: paperId.trim() || '',
                examTime: diyTime,
            },
        });
        if (res.state === 0 && res.msg === 'success') {
            message.success('考试发布成功!');
        }
    }

    addJieduan() {
        this.setState({
            addJieduanModule: true,
        });
    }

    addCiku() {
        this.setState({
            addCikuModule: true,
        });
    }

    handleJieduan(val: any) {
        const { classId } = this.state;
        this.setState({
            selJieduan: val,
        });
        this.getSetInfo(classId, val)
        console.log(val);
    }

    async handleJieduanOk() {
        const { classId } = this.state;
        const res = await this.addXinXueQi();
        const jieduanRes = await this.getJieDuanList(classId);
        const selJieduan = jieduanRes.find((item:any) => item.isCurrent)?.semesterId ?? 0
        if (res.msg === 'success') {
            this.setState({
                addJieduanModule: false,
                jieduan: jieduanRes || [],
                selJieduan,
                jieduanText: '',
            });
            Modal.confirm({
                title: '新增学习阶段',
                content: '学习阶段添加成功！请同步设置班级新的学习任务。',
                cancelText: '取消',
                okText: '确定',
            });
        }
    }

    handleJieduanCancel() {
        this.setState({
            addJieduanModule: false,
            jieduanText: '',
        });
    }

    handleCikuOk() {
        this.setState({
            addCikuModule: false,
        });
    }

    handleCikuCancel() {
        this.setState({
            addCikuModule: false,
        });
    }

    render() {
        const {
            wordType,
            wordCount,
            startType,
            wordDb,
            dbName,
            littleType,
            bigType,
            bigTime,
            bigCount,
            wordVal,
            dbVal,
            firState,
            secState,
            routes,
            paperId,
            paperName,
            diyTime,
            thrState,
            jieduan,
            selJieduan,
            addJieduanModule,
            addCikuModule,
            jieduanText,
        } = this.state;
        return (
            <div className="main-set">
                <div className="title-area">
                    <PageHeader className="site-page-header" title="" breadcrumb={{ routes }} />
                    <div className="fir-line">
                        <div className="div">设置学习任务</div>
                    </div>
                </div>
                <div className="xueqi-line">
                    <div className="line">
                        <div className="sec">
                            <span style={{ marginRight: '12px' }}>学习阶段：</span>
                            <Select
                                defaultValue="当前暂无学习阶段"
                                value={
                                    selJieduan ||
                                    (jieduan[0] && (jieduan[0] as any)?.semesterName) ||
                                    '当前暂无学习阶段'
                                }
                                style={{ width: 240 }}
                                onChange={this.handleJieduan.bind(this)}
                            >
                                {jieduan.map((item: any) => (
                                    <Option key={item.semesterId} value={item.semesterId}>
                                        {item.semesterName}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="div1">
                            <Button block onClick={this.addJieduan.bind(this)}>
                                新增阶段
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="fir-de-area">
                    <div className="fir-line">
                        <div className="left">背词设置</div>
                        <div className="right">
                            <div>i</div>
                            <div>
                                背词设置内各选项只能修改一次；保存设置后或学员开始背词后无法再做更改。
                            </div>
                        </div>
                    </div>
                    <div className="sec-line">
                        <div className="fir">
                            <div>每日背词数</div>
                            <Tooltip
                                title={content1}
                                trigger="hover"
                                placement="topLeft"
                                color="rgba(0, 0, 0, 0.7)"
                                overlayStyle={{ minWidth: '368px' }}
                            >
                                <div>i</div>
                            </Tooltip>
                        </div>
                        {!firState ? (
                            <div className="sec">
                                <span style={{ marginRight: '12px' }}>教师设置</span>
                                <Input
                                    style={{ width: 240 }}
                                    value={wordVal}
                                    onChange={this.onTeacherWordChange.bind(this)}
                                />
                                <div className="div">(推荐每日背词数为10-20个，最多40个)</div>
                            </div>
                        ) : (
                            <div className="sec">
                                <div>
                                    状态:{' '}
                                    <div className="state-co">
                                        教师设置 {` 背词数: ${wordVal} 个`}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="thr-line">
                        <div className="fir">
                            <div>是否开启选词</div>
                            <Tooltip
                                title={content2}
                                trigger="hover"
                                placement="topLeft"
                                color="rgba(0, 0, 0, 0.7)"
                                overlayStyle={{ minWidth: '410px' }}
                            >
                                <div>i</div>
                            </Tooltip>
                        </div>
                        {!firState ? (
                            <div className="sec">
                                <Radio.Group
                                    onChange={this.onStartTypeChange.bind(this)}
                                    value={startType}
                                    defaultValue="arbitrarily"
                                >
                                    <Radio value={'arbitrarily'}>是</Radio>
                                    <Radio value={'noChoice'}>否</Radio>
                                </Radio.Group>
                            </div>
                        ) : (
                            <div className="sec">
                                <div>
                                    状态:{' '}
                                    <div className="state-co">
                                        {startType === 'arbitrarily' ? '是' : '否'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="four-line">
                        <div className="fir">
                            <div>词库设置</div>
                            <Tooltip
                                title={content3}
                                trigger="hover"
                                placement="topLeft"
                                color="rgba(0, 0, 0, 0.7)"
                                overlayStyle={{ minWidth: '228px' }}
                            >
                                <div>i</div>
                            </Tooltip>
                        </div>
                        {!firState ? (
                            <div className="sec">
                                <Select
                                    defaultValue={dbVal}
                                    value={
                                        dbVal ||
                                        (wordDb[0] && (wordDb[0] as any).dictionaryId) ||
                                        '请选择'
                                    }
                                    style={{ width: 240 }}
                                    onChange={this.handleWordDb.bind(this)}
                                >
                                    {wordDb.map((item: any) => (
                                        <Option key={item.dictionaryId} value={item.dictionaryId}>
                                            {item.dictionaryName}
                                        </Option>
                                    ))}
                                </Select>
                                <div className="div1">
                                    <Button block onClick={this.addCiku.bind(this)}>
                                        添加词库
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="sec">
                                <div>
                                    当前词库: <div className="state-co">{dbName}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    {!firState ? (
                        <div className="last-line">
                            <div className="div1">
                                <Button block onClick={this.resetFir.bind(this)}>
                                    复原
                                </Button>
                            </div>
                            <Button type="primary" onClick={this.saveFir.bind(this)}>
                                保存设置
                            </Button>
                        </div>
                    ) : (
                        <div />
                    )}
                </div>
                <div className="sec-de-area">
                    <div className="fir-line">
                        <div className="left">单词测试设置</div>
                    </div>
                    <div className="sec-line">
                        <div className="fir">
                            <div>单元测试题型设置</div>
                            <Tooltip
                                title={content4}
                                trigger="hover"
                                placement="topLeft"
                                color="rgba(0, 0, 0, 0.7)"
                                overlayStyle={{ minWidth: '214px' }}
                            >
                                <div>i</div>
                            </Tooltip>
                        </div>
                        {!secState ? (
                            <div className="sec">
                                <Radio.Group
                                    onChange={this.onLittleTypeChange.bind(this)}
                                    value={littleType}
                                >
                                    <Radio value={'ch-to-en'}>展示中文释义选择英文</Radio>
                                    <Radio value={'en-to-ch'}>展示英文选择中文释义</Radio>
                                    <Radio value={'completion'}>填空</Radio>
                                    <Radio value={'random'}>随机</Radio>
                                </Radio.Group>
                            </div>
                        ) : (
                            <div className="sec">
                                <div>
                                    状态:{' '}
                                    <div className="state-co">
                                        {littleType === 'ch-to-en'
                                            ? '展示中文释义选择英文'
                                            : littleType === 'en-to-ch'
                                            ? '展示英文选择中文释义'
                                            : littleType === 'completion'
                                            ? '填空'
                                            : '随机'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="thr-line">
                        <div className="fir">
                            <div>单词阶段考设置</div>
                            <Tooltip
                                title={content5}
                                trigger="hover"
                                placement="topLeft"
                                color="rgba(0, 0, 0, 0.7)"
                                overlayStyle={{ minWidth: '620px' }}
                            >
                                <div>i</div>
                            </Tooltip>
                        </div>
                        {!secState ? (
                            <div className="sec">
                                <Radio.Group
                                    onChange={this.onBigTypeChange.bind(this)}
                                    value={bigType}
                                >
                                    <Radio value={'off'}>暂不开启</Radio>
                                    <Radio value={'on'}>开启</Radio>
                                </Radio.Group>
                                {bigType === 'on' ? (
                                    <div>
                                        <Space direction="vertical" size={12}>
                                            <DatePicker
                                                defaultValue={moment(bigTime, dateFormat)}
                                                format={dateFormat}
                                                onChange={this.onBigTimeChange.bind(this)}
                                            />
                                        </Space>
                                        <div style={{ marginLeft: 20, lineHeight: '32px' }}>
                                            考试词数：
                                        </div>
                                        <Input
                                            style={{ width: 172 }}
                                            value={bigCount}
                                            onChange={this.onBigCountChange.bind(this)}
                                        />
                                    </div>
                                ) : (
                                    <div> </div>
                                )}
                            </div>
                        ) : (
                            <div className="sec" style={{ display: 'block' }}>
                                <div style={{ marginTop: 18 }}>
                                    状态:{' '}
                                    <div className="state-co">
                                        {bigType === 'off' ? '暂不开启' : '开启'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="last-line">
                        <div className="div1">
                            <Button block onClick={this.resetSec.bind(this)}>
                                复原
                            </Button>
                        </div>
                        <Button type="primary" onClick={this.saveSec.bind(this)}>
                            保存设置
                        </Button>
                    </div>
                </div>
                <div className="thr-de-area">
                    <div className="fir-line">
                        <div className="left">自定义考试设置</div>
                    </div>
                    <div className="four-line">
                        <div className="fir">
                            <div className="title" style={{ width: 70 }}>
                                自定义考试
                            </div>
                            <span className="tips">
                                （试卷ID请前往试卷管理模块进行复制，然后粘贴在下方输入框内）
                            </span>
                        </div>
                        {!thrState ? (
                            <div>
                                <div className="sec">
                                    <div>试卷ID：</div>
                                    <Input
                                        style={{ width: 172 }}
                                        value={paperId}
                                        onChange={this.onPaperIdChange.bind(this)}
                                    />
                                    <div style={{ marginLeft: 20, color: 'rgba(0,0,0,0.65)' }}>
                                        {paperName}
                                    </div>
                                </div>
                                <div className="sec">
                                    <div>考试时间：</div>
                                    <Space direction="vertical" size={12}>
                                        <DatePicker
                                            defaultValue={moment(diyTime, dateFormat)}
                                            format={dateFormat}
                                            onChange={this.onDiyTimeChange.bind(this)}
                                        />
                                    </Space>
                                </div>
                            </div>
                        ) : (
                            <div className="sec" style={{ display: 'block' }}>
                                <div style={{ marginTop: 18 }}>
                                    试卷ID:{' '}
                                    <div className="state-co">
                                        {paperId}
                                        <span style={{ marginLeft: 20 }}>{paperName}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: 18 }}>
                                    考试时间: <div className="state-co">{diyTime}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="last-line">
                        <div className="right">
                            <div className="div1">
                                <Button block onClick={this.resetThr.bind(this)}>
                                    复原
                                </Button>
                            </div>
                            <Button type="primary" onClick={this.saveThr.bind(this)}>
                                发布考试
                            </Button>
                        </div>
                        <Button type="primary">
                            <Link to={`/app/test/testRank`}>查看已发布的考试</Link>
                        </Button>
                    </div>
                </div>
                <Modal
                    title="新增学习阶段"
                    visible={addJieduanModule}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleJieduanOk.bind(this)}
                    onCancel={this.handleJieduanCancel.bind(this)}
                >
                    <div>
                        <Alert
                            message="教师可以根据实际教学场景设置教学阶段名称；阶段名称，设置后无法进行修改，请谨慎操作！设置新阶段后，需重新设置新阶段学习任务。"
                            type="info"
                            showIcon
                        />
                        <div className="xueqi-line" style={{ marginTop: '24px' }}>
                            <div className="line" style={{ display: 'block' }}>
                                <div className="sec">
                                    <span style={{ marginRight: '12px' }}>阶段名称：</span>
                                    <Input
                                        placeholder="例：2023届大一上学期"
                                        style={{ width: 240 }}
                                        value={jieduanText}
                                        onChange={this.onJieduanTextChange.bind(this)}
                                    />
                                </div>
                                <div className="jieduanTips">
                                    （新的阶段名称不能与之前的任何阶段名称重复）
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    title="自定义添加词库"
                    visible={addCikuModule}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCikuOk.bind(this)}
                    onCancel={this.handleCikuCancel.bind(this)}
                >
                    <div>
                        如需添加自定义词库，请添加下方客服人员企业微信，我们会在稍后与您沟通详细词库需求。
                    </div>
                    <img src={img} alt="" className="chatImg" />
                </Modal>
            </div>
        );
    }
}

export default MainSet;
