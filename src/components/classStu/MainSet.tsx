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
    Table,
    Pagination,
} from 'antd';
import { Link } from 'react-router-dom';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/MainSet.less';
import { get, post, patch, baseUrl } from '../../service/tools';
import moment from 'moment';
import img from '../../style/imgs/qiyewechat.png';
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';
const dateFormat1 = 'YYYY-MM-DD HH:mm';

const { RangePicker } = DatePicker;

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
        <div>单词阶段考将按词库单词顺序依次将单词加入单词阶段考测试词库。</div>
        <div>
            开启单词阶段考后，所填考试词数，为本次单词阶段考所考词数；如第一次单词阶段考则从词库内第一个单词计数。
        </div>
        <div>若非第一次单词阶段考，则从上次单词阶段考最后一个词的后一个词开始计数，以此类推。</div>
    </div>
);

const content6 = (
    <div className="popColor">
        <div>测试：学生提交作文后，需老师逐一审阅并发布成绩。</div>
        <div>练习：学生未提交作文前，有三次机会修改作文并使用 AI 智能批改功能对作文内容完善。</div>
    </div>
);

const FunGetDateStr = (p_count: any, nowDate: any) => {
    let dd = nowDate;
    dd.setDate(dd.getDate() + p_count); //获取p_count天后的日期
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1; //获取当前月份的日期
    let d = dd.getDate();
    return y + '-' + m + '-' + d;
};

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
        thrState: 1,
        reciteSetting: false,
        paperId: '',
        paperName: '',
        diyTime: [moment(), moment().endOf('day')],
        jieduan: [],
        selJieduan: '',
        curJieduan: '',
        canSet: false,
        addJieduanModule: false,
        addCikuModule: false,
        jieduanText: '',
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
        ],
        pici: [],
        createExamName: '',
        createWritingId: '',
        createExamType: 'practice',
        createStartTime: moment().format(dateFormat1),
        createEndTime: moment(new Date(FunGetDateStr(7, new Date()) + ' 00:00:00') as any).format(
            dateFormat1
        ),
    };

    async componentWillMount() {
        console.log(this.state.bigTime);
        const classId = window.location.href.split('=')[1];
        await this.getKu();
        const jieduanRes = await this.getJieDuanList(classId);
        const teacherId = Number(localStorage.getItem('classTeacherId'));
        const pici = await this.getPici(teacherId);
        const selJieduan = jieduanRes[0]
            ? jieduanRes.find((item: any) => item.isCurrent)?.semesterId ?? 0
            : 0;
        console.log('use jieduan', jieduanRes);
        let res = await this.getSetInfo(classId, selJieduan);
        let dbName = '';
        const dbVal = res?.data?.dictionaryId || 0;
        const firState = dbVal ? 0 : selJieduan;
        const { wordDb } = this.state;
        wordDb.forEach((val: any) => {
            if (val?.dictionaryId === res?.data?.dictionaryId) {
                dbName = val?.dictionaryName;
            }
        });

        this.setState({
            jieduan: jieduanRes || [],
            selJieduan,
            curJieduan: selJieduan,
            canSet: res?.data?.canSet,
            firState,
            startType: res?.data?.choiceWordsMethod || 'arbitrarily',
            wordVal: res?.data?.reciteVersion ? +res?.data?.reciteVersion : 0,
            dbVal,
            dbName: dbName || '',
            littleType: res?.data?.wordTestType || '',
            bigType: res?.data?.stageWordsTest || '',
            specialTestDate: res?.data?.specialTestDate || new Date(),
            paperId: res?.data?.specialTestID || '',
            bigCount: res?.data?.stageTestReciteVersion || 0,
            pici,
        });

        this.setState({
            classId,
        });
    }

    async getPici(teacherId: any) {
        const res = await get({
            url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}`,
        });
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }

    async getJieDuanList(id: any) {
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?classId=${id}`,
        });
        return res?.data;
    }

    async getSetInfo(classId: any, semesterId: any) {
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester?classId=${classId}&semesterId=${semesterId}`,
        });
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
        console.log('this.state', this.state);
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
            if (res.state === 0) {
                message.success('背词设置保存成功!');
            } else {
                message.error(`背词设置保存失败：${res.msg}`);
            }
        });
    }
    setTest() {
        const { littleType, bigType, bigCount, classId, paperId, selJieduan } = this.state;
        let params: any = {};
        if (bigType === 'on') {
            params = {
                wordTestType: littleType || 'random',
                stageWordsTest: bigType || 'off',
                specialTestType: 'customTest',
                specialTestID: paperId,
                classId: +classId,
                semesterId: +selJieduan,
                stageTestReciteVersion: +bigCount,
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
    onTeacherWordBlur(event: any) {
        const wordVal = event.target.value;
        if (wordVal && wordVal < 5) {
            message.warn('背词数设置过少');
        } else if (wordVal > 40) {
            message.warn('背词数设置过多');
        }
    }
    onTeacherWordChange(event: any) {
        const wordVal = event.target.value;
        this.setState({
            wordVal: wordVal,
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
        const { wordDb, dbVal, wordVal } = this.state;
        if (wordVal < 5 || wordVal > 100) {
            message.warn('数量限制5~100词');
            return;
        }
        this.setState({
            firState: 0,
        });
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
                firState: 1,
                startType: res?.data?.choiceWordsMethod || 'noChoice',
                wordVal: res?.data?.reciteVersion ? +res?.data?.reciteVersion : 0,
                dbVal: res?.data?.dictionaryId || 0,
                bigCount: res?.data?.stageTestReciteVersion || 0,
                canSet: res?.data?.canSet,
            },
            () => {
                // this.getTestData();
            }
        );
        this.getKu();
    }
    saveSec() {
        this.setState({
            secState: 0,
        });
        this.setTest();
    }
    async resetSec() {
        const { classId, selJieduan } = this.state;
        let res = await this.getSetInfo(classId, selJieduan);
        this.setState({
            secState: 1,
            canSet: res?.data?.canSet,
            littleType: res.data.wordTestType,
            bigType: res.data.stageWordsTest,
            specialTestDate: res.data.specialTestDate,
            paperId: res?.data?.specialTestID,
            bigCount: res?.data?.stageTestReciteVersion,
        });
    }
    saveThr() {
        this.diyExam();
    }
    async resetThr() {
        const { classId, selJieduan } = this.state;
        let res = await this.getSetInfo(classId, selJieduan);
        this.setState({
            thrState: 1,
            paperId: res?.data?.specialTestID,
            canSet: res?.data?.canSet,
        });
    }

    onPaperIdChange(event: any) {
        this.setState({
            paperId: event.target.value,
        });
    }
    onPaperNameChange(event: any) {
        this.setState({
            paperName: event.target.value,
        });
    }

    /** 单个试卷信息 */
    async getTestData() {
        const { paperId } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/question-paper/?questionPaperId=${paperId}`,
        });
        console.log(res);
        this.setState({
            paperName: res?.data?.examName,
        });
    }

    onDiyTimeChange(date: any, dateString: any) {
        this.setState({
            diyTime: [moment(date[0]), moment(date[1])],
        });
        console.log(date, dateString);
    }

    async diyExam() {
        const { paperId, paperName, classId, diyTime } = this.state;
        if (!paperId) {
            message.warning('请填写试卷ID');
            return;
        }
        if (!paperName) {
            message.warning('请填写试卷名称');
            return;
        }
        let res = await post({
            url: baseUrl + '/api/v1/exam/',
            data: {
                classId: +classId,
                questionPaperId: paperId.trim() || '',
                examStartTime: `${moment(diyTime[0]).add(1, 'seconds').format(dateFormat1)}`,
                examEndTime: `${moment(diyTime[1]).format(dateFormat1)}`,
                examName: paperName,
            },
        });
        if (res.state === 0 && res.msg === 'success') {
            this.setState({
                thrState: 0,
            });
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

    async handleJieduan(val: any) {
        const { classId, curJieduan, wordDb } = this.state;
        const res = await this.getSetInfo(classId, val);
        let dbName = '';
        wordDb.forEach((val: any) => {
            if (val?.dictionaryId === res?.data?.dictionaryId) {
                dbName = val?.dictionaryName;
                // console.log('ssss', dbName)
            }
        });
        this.setState({
            selJieduan: val,
            firState: res?.data?.dictionaryId ? 0 : 1,
            canSet: res?.data?.canSet,
            startType: res?.data?.choiceWordsMethod || 'arbitrarily',
            wordVal: res?.data?.reciteVersion ? +res?.data?.reciteVersion : 0,
            dbVal: res?.data?.dictionaryId || 0,
            dbName: dbName || '',
            littleType: res?.data?.wordTestType || '',
            bigType: res?.data?.stageWordsTest || '',
            bigCount: res?.data?.stageTestReciteVersion || 0,
            // TODO: 当前未返回paperId 导致js报错阻塞
            // thrState: val === curJieduan ? 1 : 0,
        });
    }

    async handleJieduanOk() {
        const { classId } = this.state;
        const res = await this.addXinXueQi();
        const jieduanRes = await this.getJieDuanList(classId);
        const selJieduan = jieduanRes.find((item: any) => item.isCurrent)?.semesterId ?? 0;
        if (res.msg === 'success') {
            this.setState({
                addJieduanModule: false,
                jieduan: jieduanRes || [],
                curJieduan: selJieduan,
                jieduanText: '',
                secState: 1,
            });
            this.handleJieduan(selJieduan);
            Modal.confirm({
                title: '新增词库任务',
                content: '词库任务添加成功！请同步设置班级新的学习任务。',
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

    onCreateExamNameChange(event: any) {
        this.setState({
            createExamName: event.target.value,
        });
    }

    onCreateWritingIdChange(event: any) {
        this.setState({
            createWritingId: event.target.value,
        });
    }
    onCreateExamTypeChange(event: any) {
        this.setState({
            createExamType: event.target.value,
        });
    }
    onCreateStartTimeChange(date: any, dateString: any) {
        this.setState({
            createStartTime: dateString,
        });
    }
    onCreateEndTimeChange(date: any, dateString: any) {
        this.setState({
            createEndTime: dateString,
        });
    }

    async handleCreateOk(val: any) {
        const {
            classId,
            createExamName,
            createWritingId,
            createExamType,
            createStartTime,
            createEndTime,
        } = this.state;
        if (
            !createExamName ||
            !createWritingId ||
            !createExamType ||
            !createStartTime ||
            !createEndTime
        ) {
            message.error('请填写新建作文任务的必要信息');
            return;
        }
        let res = await post({
            url: `${baseUrl}/api/v1/writing-exam/`,
            data: {
                name: createExamName,
                writingId: createWritingId,
                startTime: createStartTime,
                endTime: createEndTime,
                examType: createExamType,
                classList: [+classId],
            },
        });
        if (res.state === 0) {
            message.success('发布作文任务成功');
            this.setState({
                isVisible: false,
                createExamName: '',
                createWritingId: '',
                createExamType: 'practice',
                createStartTime: moment().format(dateFormat1),
                createEndTime: moment(
                    new Date(FunGetDateStr(7, new Date()) + ' 00:00:00') as any
                ).format(dateFormat1),
            });
        } else {
            message.error(`发布作文任务失败:${res.msg}`);
        }
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
            curJieduan,
            canSet,
            pici,
            createExamName,
            createWritingId,
            createExamType,
            createStartTime,
            createEndTime,
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
                    {selJieduan || jieduan[0] ? (
                        ''
                    ) : (
                        <div className="xueqi-tips">
                            <div>i</div>
                            <div>新创建的班级，需要添加一个词库任务后，才能设置学习任务。</div>
                        </div>
                    )}
                    <div className="line">
                        <div className="sec">
                            <span style={{ marginRight: '12px' }}>词库任务：</span>
                            <Select
                                defaultValue="当前暂无词库任务"
                                value={
                                    selJieduan ||
                                    (jieduan[0] && (jieduan[0] as any)?.semesterName) ||
                                    '当前暂无词库任务'
                                }
                                style={{ width: 480 }}
                                onChange={this.handleJieduan.bind(this)}
                            >
                                {jieduan.map((item: any) => (
                                    <Option key={item.semesterId} value={item.semesterId}>
                                        {item.semesterName}
                                        {item.isCurrent ? <span>（当前任务）</span> : ''}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="div1">
                            <Button block onClick={this.addJieduan.bind(this)}>
                                + 新增任务
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="fir-de-area">
                    <div className="fir-line">
                        <div className="left">背词设置</div>
                        <div className="right">
                            <div className="fir-line-icon">i</div>
                            <div>
                                <div>
                                    背词设置内除每日背词数选项外，其他选项在当前任务内只能设置一次；保存设置后或学员开始背词后无法再做更改。
                                </div>
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
                        {firState ? (
                            <div className="sec">
                                <span style={{ marginRight: '12px' }}>教师设置</span>
                                <Input
                                    disabled={curJieduan !== selJieduan}
                                    style={{ width: 240 }}
                                    value={wordVal}
                                    onBlur={this.onTeacherWordBlur.bind(this)}
                                    onChange={this.onTeacherWordChange.bind(this)}
                                />
                                <div className="div">(推荐每日最低背词数：10~20 个)</div>
                            </div>
                        ) : (
                            <div className="sec sec-save">
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
                        {firState ? (
                            <div className="sec">
                                <Radio.Group
                                    onChange={this.onStartTypeChange.bind(this)}
                                    value={startType}
                                    defaultValue="arbitrarily"
                                    // disabled={!selJieduan || !canSet}
                                    disabled
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
                        {firState ? (
                            <div className="sec">
                                <Select
                                    defaultValue={dbVal}
                                    disabled={!selJieduan || !canSet}
                                    value={dbVal || '请选择'}
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
                                    <Tooltip
                                        title="可自定义添加词库"
                                        trigger="hover"
                                        placement="top"
                                        color="rgba(0, 0, 0, 0.7)"
                                    >
                                        <Button
                                            block
                                            disabled={!selJieduan}
                                            onClick={this.addCiku.bind(this)}
                                        >
                                            <PlusOutlined />
                                            添加词库
                                        </Button>
                                    </Tooltip>
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
                    <div className="last-line">
                        {firState ? (
                            <Button
                                type="primary"
                                disabled={!selJieduan || curJieduan !== selJieduan}
                                onClick={this.saveFir.bind(this)}
                            >
                                保存设置
                            </Button>
                        ) : (
                            <div className="div1">
                                <Tooltip
                                    title={'如需调整教学进度，可对每日单词数进行更改。'}
                                    trigger="hover"
                                    placement="top"
                                    color="rgba(0, 0, 0, 0.7)"
                                    overlayStyle={{ minWidth: '214px' }}
                                >
                                    <Button
                                        block
                                        disabled={!selJieduan || curJieduan !== selJieduan}
                                        onClick={this.resetFir.bind(this)}
                                    >
                                        修改
                                    </Button>
                                </Tooltip>
                            </div>
                        )}
                    </div>
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
                        {secState ? (
                            <div className="sec">
                                <Radio.Group
                                    onChange={this.onLittleTypeChange.bind(this)}
                                    value={littleType}
                                    // disabled={!selJieduan}
                                    disabled
                                >
                                    <Radio value={'ch-to-en'}>展示中文释义选择英文</Radio>
                                    <Radio value={'en-to-ch'}>展示英文选择中文释义</Radio>
                                    {/* <Radio value={'completion'}>填空</Radio> */}
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
                        {secState ? (
                            <div className="sec">
                                <Radio.Group
                                    onChange={this.onBigTypeChange.bind(this)}
                                    value={bigType}
                                    disabled
                                >
                                    <Radio value={'off'}>暂不开启</Radio>
                                    <Radio value={'on'}>开启</Radio>
                                </Radio.Group>
                                {bigType === 'on' ? (
                                    <div>
                                        {/* <Space direction="vertical" size={12}>
                                            <DatePicker
                                                defaultValue={moment(bigTime, dateFormat)}
                                                format={dateFormat}
                                                onChange={this.onBigTimeChange.bind(this)}
                                            />
                                        </Space> */}
                                        <div style={{ marginLeft: 20, lineHeight: '32px' }}>
                                            考试词数：
                                        </div>
                                        <Input
                                            disabled
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
                        {secState ? (
                            <Button
                                type="primary"
                                disabled={!selJieduan || curJieduan !== selJieduan}
                                onClick={this.saveSec.bind(this)}
                            >
                                保存设置
                            </Button>
                        ) : (
                            <div className="div1">
                                <Button
                                    block
                                    disabled={!selJieduan || curJieduan !== selJieduan}
                                    onClick={this.resetSec.bind(this)}
                                >
                                    修改
                                </Button>
                            </div>
                        )}
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
                        {thrState ? (
                            <div>
                                <div className="sec">
                                    <div style={{ marginRight: 15 }}>试卷ID：</div>
                                    <Input
                                        disabled={!selJieduan}
                                        style={{ width: 172 }}
                                        value={paperId}
                                        onChange={this.onPaperIdChange.bind(this)}
                                    />
                                </div>
                                <div className="sec">
                                    <div>考试名称：</div>
                                    <Input
                                        disabled={!selJieduan}
                                        style={{ width: 172 }}
                                        value={paperName}
                                        onChange={this.onPaperNameChange.bind(this)}
                                    />
                                </div>
                                <div className="sec">
                                    <div>考试时间：</div>
                                    <Space direction="vertical" size={12}>
                                        <RangePicker
                                            defaultValue={[moment(), moment()]}
                                            onChange={this.onDiyTimeChange.bind(this)}
                                        />
                                        {/* <DatePicker
                                            defaultValue={moment(diyTime, dateFormat)}
                                            format={dateFormat}
                                            onChange={this.onDiyTimeChange.bind(this)}
                                        /> */}
                                    </Space>
                                </div>
                            </div>
                        ) : (
                            <div className="sec" style={{ display: 'block' }}>
                                <div style={{ marginTop: 18 }}>
                                    试卷ID: <div className="state-co">{paperId}</div>
                                </div>
                                <div style={{ marginTop: 18 }}>
                                    试卷名称: <div className="state-co">{paperName}</div>
                                </div>
                                <div style={{ marginTop: 18 }}>
                                    考试时间:{' '}
                                    <div className="state-co">
                                        {moment(diyTime[0]).format(dateFormat)}-
                                        {moment(diyTime[1]).format(dateFormat)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="last-line">
                        <div className="right">
                            {/* <div className="div1">
                                <Button
                                    block
                                    disabled={!selJieduan || curJieduan !== selJieduan}
                                    onClick={this.resetThr.bind(this)}
                                >
                                    {thrState?'复原':'修改'}
                                </Button>
                            </div> */}
                            <Button
                                type="primary"
                                disabled={!selJieduan || curJieduan !== selJieduan}
                                onClick={this.saveThr.bind(this)}
                            >
                                发布考试
                            </Button>
                        </div>
                        <Button disabled={!selJieduan} type="primary">
                            <Link
                                to={`/app/test/testRank?examName=${encodeURI(
                                    paperName
                                )}&selSemester=${selJieduan}`}
                            >
                                查看已发布的考试
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="thr-de-area" style={{ height: 'auto' }}>
                    <div className="fir-line">
                        <div className="left">作文发布设置</div>
                    </div>
                    <div className="four-line" style={{ height: 'auto' }}>
                        <div className="fir">
                            <div className="title" style={{ width: 90 }}>
                                发布作文任务
                            </div>
                            <span className="tips">
                                （作文ID请前往作文管理模块进行复制,然后粘贴在下方输入框内）
                            </span>
                        </div>
                        <div className="exam-module-area">
                            <span className="span">任务名称:</span>
                            <Input
                                disabled={!selJieduan}
                                className="gap-8"
                                placeholder="请输入作文任务名称"
                                value={createExamName}
                                onChange={this.onCreateExamNameChange.bind(this)}
                                maxLength={200}
                            />
                        </div>
                        <div className="exam-module-area exam-module-area2">
                            <div className="left">
                                <span className="span span1">作文ID:</span>
                                <Input
                                    disabled={!selJieduan}
                                    className="gap-8"
                                    style={{ width: 150 }}
                                    placeholder="请输入作文ID"
                                    value={createWritingId}
                                    onChange={this.onCreateWritingIdChange.bind(this)}
                                    maxLength={200}
                                />
                            </div>
                            <div className="right">
                                <span className="span span2">
                                    任务类型
                                    <span className="span-tips">
                                        <Tooltip
                                            title={content6}
                                            trigger="hover"
                                            placement="top"
                                            color="rgba(0, 0, 0, 0.7)"
                                            overlayStyle={{ minWidth: '300px' }}
                                        >
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </span>
                                    :
                                </span>
                                <Radio.Group
                                    onChange={this.onCreateExamTypeChange.bind(this)}
                                    value={createExamType}
                                    defaultValue="practice"
                                    disabled={!selJieduan}
                                >
                                    <Radio value={'test'}>测试</Radio>
                                    <Radio value={'practice'}>练习</Radio>
                                </Radio.Group>
                            </div>
                        </div>
                        <div className="exam-module-area exam-module-area2">
                            <div className="left">
                                <span className="span span2">开始时间:</span>
                                <Space direction="vertical" size={12}>
                                    <DatePicker
                                        disabled={!selJieduan}
                                        defaultValue={moment(createStartTime, dateFormat1)}
                                        format={dateFormat1}
                                        onChange={this.onCreateStartTimeChange.bind(this)}
                                    />
                                </Space>
                            </div>
                            <div className="right">
                                <span className="span span2">截止时间:</span>
                                <Space direction="vertical" size={12}>
                                    <DatePicker
                                        disabled={!selJieduan}
                                        defaultValue={moment(createEndTime, dateFormat1)}
                                        format={dateFormat1}
                                        onChange={this.onCreateEndTimeChange.bind(this)}
                                    />
                                </Space>
                            </div>
                        </div>
                    </div>
                    <div className="last-line" style={{ paddingBottom: '32px' }}>
                        <div className="right">
                            <Button
                                type="primary"
                                disabled={!selJieduan || curJieduan !== selJieduan}
                                onClick={this.handleCreateOk.bind(this)}
                            >
                                发布作文
                            </Button>
                        </div>
                        <Button disabled={!selJieduan} type="primary">
                            <Link to={`/app/writing/writingExam`}>查看已发布作文</Link>
                        </Button>
                    </div>
                </div>
                <Modal
                    title="新增词库任务"
                    visible={addJieduanModule}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleJieduanOk.bind(this)}
                    onCancel={this.handleJieduanCancel.bind(this)}
                >
                    <div>
                        {!selJieduan ? (
                            <Alert
                                message="教师可以根据实际教学场景设置教学任务名称；任务名称设置后无法进行修改，请谨慎操作！设置新阶段后，需设置新阶段学习任务。"
                                type="info"
                                showIcon
                            />
                        ) : (
                            <Alert
                                message="新增词库任务 适用于开展新的词库任务学习；开启新词库任务后，当前词库任务的所有词库内容将自动停止且无法回退，请谨慎操作！"
                                type="info"
                                showIcon
                            />
                        )}
                        <div className="xueqi-line" style={{ marginTop: '24px' }}>
                            <div className="line" style={{ display: 'block' }}>
                                <div className="sec">
                                    <span style={{ color: 'red', marginRight: '6px' }}>*</span>
                                    <span style={{ marginRight: '12px' }}>任务名称：</span>
                                    <Input
                                        placeholder="例：任务1"
                                        style={{ width: 240 }}
                                        value={jieduanText}
                                        onChange={this.onJieduanTextChange.bind(this)}
                                    />
                                </div>
                                <div className="jieduanTips">
                                    （新的任务名称不能与之前的任何任务名称重复）
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
