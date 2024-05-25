import React from 'react';
import { Input, Button, PageHeader, Alert, message, Select, Radio } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QuestionAddLongReading.less';
import { get, post, baseUrl } from '../../service/tools';

const { TextArea } = Input;
const { Option } = Select;

/** 截取url */
const GetRequest = () => {
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
};

const SELECT_TP: any = {
    cet4: '四级',
    cet6: '六级',
};

const SELECT_TP_LIST = ['cet4', 'cet6'];

const YEAR_MAP = new Array(new Date().getFullYear() - 1950).fill(0).map((item, index) => {
    return `${index + 1951}`;
});

const A_Z = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
];

class QuestionAddLongReading extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetailLongReading',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建题库'}`,
            },
            {
                path: '/questionAddLongReading',
                breadcrumbName: '新增试题',
            },
        ],
        bankID: '',
        setType: '',
        title: '',
        topic: '',
        selectYear: YEAR_MAP[YEAR_MAP.length - 1],
        selectTp: 'cet4',
        genuine: true,
        questions: [
            {
                qStem: '',
                rightKey: undefined,
            },
            {
                qStem: '',
                rightKey: undefined,
            },
        ],
        options: [
            {
                key: 'A',
                value: '',
            },
            {
                key: 'B',
                value: '',
            },
        ],
    };
    componentWillMount() {
        this.inited();
    }

    async inited() {
        this.setState({
            bankID: GetRequest()['bankID'],
            setType: GetRequest()['setType'],
        });
    }

    /** 保存试题 */
    async saveQuestion() {
        const res = await this.saveQuestionInterface();
        if (res.state === 0) {
            message.success('保存成功');
            setTimeout(() => {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailLongReading`;
            }, 200);
        }
    }

    /** 保存接口 */
    async saveQuestionInterface() {
        const { bankID, setType, title, genuine, selectYear, selectTp, options, questions, topic } =
            this.state;
        const response: any = await post({
            url: baseUrl + '/api/v1/question-set/question',
            data: {
                setId: bankID,
                setType,
                questionList: [
                    {
                        title,
                        topic,
                        genuine,
                        year: selectYear,
                        tp: selectTp,
                        options,
                        questions,
                    },
                ],
            },
        });
        return response;
    }

    handleTitle(event: any) {
        const valData = event.target.value;
        this.setState({
            title: valData,
        });
    }

    handleTopic(event: any) {
        const valData = event.target.value;
        this.setState({
            topic: valData,
        });
    }

    handleSelectTp(val: any) {
        this.setState({
            selectTp: val,
        });
    }

    handleSelectYear(val: any) {
        this.setState({
            selectYear: val,
        });
    }

    /** 切换真题 */
    onGenuineChange(val: any) {
        console.log(val);
        this.setState({
            genuine: val.target.value,
        });
    }

    updateOptions(val: any, index: number, event: any) {
        const { options } = this.state;
        const valData = event.target.value;
        options[index].value = valData;
        this.setState({
            options,
        });
    }

    /** 删除试题 */
    delQuestion(index: number) {
        const { options } = this.state;
        options.splice(index, 1);
        options.forEach((item: any, index: number) => {
            item.key = A_Z[index];
        });
        this.setState({
            options,
        });
    }

    /** 增加输入框 */
    addQuestion() {
        const { options } = this.state;
        this.setState({
            options: [...options, { key: A_Z[options.length], value: '' }],
        });
    }

    updateStem(val: any, index: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        questions[index].qStem = valData;
        this.setState({
            questions,
        });
    }

    /** 删除题干 */
    delStem(index: number) {
        const { questions } = this.state;
        questions.splice(index, 1);
        this.setState({
            questions,
        });
    }

    /** 增加题干 */
    addStem() {
        const { questions } = this.state;
        this.setState({
            questions: [
                ...questions,
                {
                    qStem: '',
                    rightKey: undefined,
                },
            ],
        });
    }

    handelAnswer(index: any, val: any) {
        const { questions } = this.state;
        questions[index].rightKey = val;
        this.setState({
            questions,
        });
    }

    render() {
        const { routes, title, selectYear, selectTp, genuine, options, questions, topic } =
            this.state;
        return (
            <div className="question-add-long-reading-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">新增试题_词汇理解-选词填空</div>
                    </div>
                </div>
                <div className="body">
                    <div className="input-block">
                        <div className="left">
                            <div className="mt-8">标题:</div>
                            <Input
                                className="mt-8"
                                placeholder="请输入"
                                value={title}
                                onChange={this.handleTitle.bind(this)}
                            />
                            <div className="mt-8">选项:</div>
                            <div className="mt-8 option-area">
                                <div
                                    className="mt-8"
                                    style={{ display: 'flex', alignItems: 'center' }}
                                >
                                    文章主题：
                                    <Input
                                        placeholder="请输入"
                                        value={topic}
                                        style={{ flex: 1 }}
                                        onChange={this.handleTopic.bind(this)}
                                    />
                                </div>
                                {options.map((val, index) => (
                                    <div className="item">
                                        <span className="title">{val.key}：</span>
                                        <TextArea
                                            className="gap-8"
                                            value={val.value}
                                            style={{ width: '92%', height: 140, resize: 'none' }}
                                            onChange={this.updateOptions.bind(this, val, index)}
                                        />
                                        <span
                                            className="del"
                                            onClick={this.delQuestion.bind(this, index)}
                                        >
                                            <DeleteOutlined />
                                        </span>
                                    </div>
                                ))}
                                {options.length < 25 && (
                                    <div className="add" onClick={this.addQuestion.bind(this)}>
                                        <Button
                                            style={{ width: '88%' }}
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                        >
                                            添加一个选项
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="right">
                            <div className="flex-block mt-8">
                                <div>
                                    <div>是否为真题:</div>
                                    <Radio.Group
                                        className="mt-8"
                                        onChange={this.onGenuineChange.bind(this)}
                                        value={genuine}
                                    >
                                        <Radio value={true}>是</Radio>
                                        <Radio value={false}>否</Radio>
                                    </Radio.Group>
                                </div>
                                <div>
                                    <div>年份:</div>
                                    <Select
                                        className="mt-8"
                                        defaultValue={selectYear}
                                        style={{ width: 140 }}
                                        placeholder="请选择学员批次"
                                        onChange={this.handleSelectYear.bind(this)}
                                        value={selectYear}
                                    >
                                        {YEAR_MAP.map((item: any, index: number) => (
                                            <Option key={index} value={item}>
                                                {item}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <div>类型:</div>
                                    <Select
                                        className="mt-8"
                                        defaultValue={selectTp}
                                        style={{ width: 140 }}
                                        placeholder="类型"
                                        onChange={this.handleSelectTp.bind(this)}
                                        value={selectTp}
                                    >
                                        {SELECT_TP_LIST.map((item: any, index: number) => (
                                            <Option key={index} value={item}>
                                                {SELECT_TP[item] || '未知'}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-8">题干:</div>
                            <div className="mt-8 option-area">
                                {questions.map((val, index) => (
                                    <div>
                                        <div className="item">
                                            <span className="title">{index + 1}：</span>
                                            <TextArea
                                                className="gap-8"
                                                value={val.qStem}
                                                style={{
                                                    width: '92%',
                                                    height: 100,
                                                    resize: 'none',
                                                }}
                                                onChange={this.updateStem.bind(this, val, index)}
                                            />
                                            <span
                                                className="del"
                                                onClick={this.delStem.bind(this, index)}
                                            >
                                                <DeleteOutlined />
                                            </span>
                                        </div>
                                        <div className="sel">
                                            <Select
                                                className="mt-8"
                                                style={{ width: '95.5%' }}
                                                placeholder="请选择匹配答案"
                                                onChange={this.handelAnswer.bind(this, index)}
                                                value={val.rightKey}
                                            >
                                                {A_Z.map((item: any, index: number) => (
                                                    <Option key={index} value={item}>
                                                        {item}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                                {questions.length < 26 && (
                                    <div className="add" onClick={this.addStem.bind(this)}>
                                        <Button
                                            style={{ width: '88%' }}
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                        >
                                            添加一个选项
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="tools">
                        <Button type="primary" onClick={this.saveQuestion.bind(this)}>
                            保存
                        </Button>
                        <Link to={'/app/queBankCreate/bankDetailLongReading'}>
                            <Button>取消</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionAddLongReading;
