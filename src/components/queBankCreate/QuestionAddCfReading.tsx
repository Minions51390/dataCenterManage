import React from 'react';
import { Input, Button, PageHeader, Alert, message, Select, Radio, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QuestionAddCfReading.less';
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

class QuestionAddCfReading extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetailCfReading',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建题库'}`,
            },
            {
                path: '/questionAddCfReading',
                breadcrumbName: '新增试题',
            },
        ],
        bankID: '',
        setType: '',
        title: `entry ${+(GetRequest()['questionCount'] || 0) + 1}`,
        stem: '',
        selectYear: YEAR_MAP[YEAR_MAP.length - 1],
        selectTp: 'cet4',
        genuine: true,
        fatherGenuine: Boolean(+(GetRequest()['genuine'] || 0)),
        questions: [
            {
                qStem: '',
                options: [
                    { key: 'A', value: '' },
                    { key: 'B', value: '' },
                    { key: 'C', value: '' },
                    { key: 'D', value: '' },
                ],
                rightKey: 'A',
            },
            {
                qStem: '',
                options: [
                    { key: 'A', value: '' },
                    { key: 'B', value: '' },
                    { key: 'C', value: '' },
                    { key: 'D', value: '' },
                ],
                rightKey: 'A',
            },
        ],
        saveLoading: false,
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
        const { questions } = this.state;
        if (questions.length < 5) {
            Modal.confirm({
                title: '新建题库',
                icon: <ExclamationCircleOutlined />,
                content: '试题不满足标准题型要求，请再次确认是否保存',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    this.saveQuestionBack();
                },
            });
            return;
        }
        this.saveQuestionBack();
    }

    /** 保存试题 */
    async saveQuestionBack() {
        const res = await this.saveQuestionInterface();
        if (res.state === 0) {
            this.setState({
                saveLoading: true,
            });
            message.success('保存成功');
            setTimeout(() => {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailCfReading`;
            }, 200);
        }
    }

    /** 保存接口 */
    async saveQuestionInterface() {
        const { bankID, setType, title, stem, genuine, selectYear, selectTp, questions } =
            this.state;
        const response: any = await post({
            url: baseUrl + '/api/v1/question-set/question',
            data: {
                setId: bankID,
                setType,
                questionList: [
                    {
                        title,
                        stem,
                        genuine,
                        year: selectYear,
                        tp: selectTp,
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

    handleStem(event: any) {
        const valData = event.target.value;
        this.setState({
            stem: valData,
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

    updateQStem(val: any, index: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        questions[index].qStem = valData;
        this.setState({
            questions,
        });
    }

    updateOptionVal(val: any, index: number, key: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        questions[index].options[key].value = valData;
        this.setState({
            questions,
        });
    }

    updateRightChange(val: any, index: number, event: any) {
        const { questions } = this.state;
        const valData = event.target.value;
        questions[index].rightKey = valData;
        this.setState({
            questions,
        });
    }

    /** 增加输入框 */
    addQuestion() {
        const { questions } = this.state;
        this.setState({
            questions: [
                ...questions,
                {
                    qStem: '',
                    options: [
                        { key: 'A', value: '' },
                        { key: 'B', value: '' },
                        { key: 'C', value: '' },
                        { key: 'D', value: '' },
                    ],
                    rightKey: 'A',
                },
            ],
        });
    }

    /** 删除试题 */
    delQuestion(index: number) {
        const { questions } = this.state;
        questions.splice(index, 1);
        this.setState({
            questions,
        });
    }

    render() {
        const {
            routes,
            title,
            stem,
            selectYear,
            selectTp,
            genuine,
            questions,
            fatherGenuine,
            saveLoading,
        } = this.state;
        return (
            <div className="question-add-cf-reading-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">新增试题_词汇理解-选词填空</div>
                    </div>
                </div>
                <div className="body">
                    <div className="input-block">
                        <div className="firLine">
                            <div>标题:</div>
                            <Input
                                className="ml-14"
                                placeholder="请输入"
                                value={title}
                                style={{ width: 180 }}
                                onChange={this.handleTitle.bind(this)}
                            />
                            <div className="ml-14">是否为真题:</div>
                            <Radio.Group
                                className="ml-14"
                                onChange={this.onGenuineChange.bind(this)}
                                value={genuine}
                                disabled={fatherGenuine}
                            >
                                <Radio value={true}>是</Radio>
                                <Radio value={false}>否</Radio>
                            </Radio.Group>
                            <div className="ml-14">
                                {fatherGenuine ? (
                                    <span style={{ color: '#f00', marginRight: '4px' }}>*</span>
                                ) : (
                                    ''
                                )}
                                年份:
                            </div>
                            <Select
                                className="ml-14"
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
                            <div className="ml-14">
                                <span style={{ color: '#f00', marginRight: '4px' }}>*</span>类型:
                            </div>
                            <Select
                                className="ml-14"
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
                        <div className="secLine">
                            <div className="mt-8">短文:</div>
                            <TextArea
                                className="mt-8"
                                value={stem}
                                onChange={this.handleStem.bind(this)}
                                style={{ height: 240, resize: 'none' }}
                            />
                        </div>
                        <div className="thrLine">
                            <div className="mt-8">小题:</div>
                            <div className="mt-8 option-area">
                                {questions.map((val, index) => (
                                    <div className="item">
                                        <div className="titleBlock">
                                            <span className="title">{index + 1}：</span>
                                            <Input
                                                className="gap-8"
                                                value={val.qStem}
                                                style={{ flex: 1 }}
                                                onChange={this.updateQStem.bind(this, val, index)}
                                            />
                                            <div
                                                className="del"
                                                onClick={this.delQuestion.bind(this, index)}
                                            >
                                                <DeleteOutlined />
                                            </div>
                                        </div>
                                        <div className="questionBlock">
                                            <div className="left">
                                                {val.options.map((val, key) => {
                                                    return (
                                                        <div className="optionBlock">
                                                            <div className="title">{val.key} :</div>
                                                            <Input
                                                                className="gap-8"
                                                                value={val.value}
                                                                style={{ flex: 1 }}
                                                                onChange={this.updateOptionVal.bind(
                                                                    this,
                                                                    val,
                                                                    index,
                                                                    key
                                                                )}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="right">
                                                <div className="checkBlock">
                                                    <Radio.Group
                                                        className="myRadio"
                                                        onChange={this.updateRightChange.bind(
                                                            this,
                                                            val,
                                                            index
                                                        )}
                                                        value={val.rightKey}
                                                    >
                                                        <Radio className="inner" value="A">
                                                            {val.rightKey === 'A'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                        <Radio className="inner" value="B">
                                                            {val.rightKey === 'B'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                        <Radio className="inner" value="C">
                                                            {val.rightKey === 'C'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                        <Radio className="inner" value="D">
                                                            {val.rightKey === 'D'
                                                                ? '设为正确答案'
                                                                : ''}
                                                        </Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="add" onClick={this.addQuestion.bind(this)}>
                                    <Button
                                        style={{ width: '100%' }}
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                    >
                                        添加一个选项
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tools">
                        <Button
                            type="primary"
                            loading={saveLoading}
                            onClick={this.saveQuestion.bind(this)}
                        >
                            保存
                        </Button>
                        <Link to={'/app/queBankCreate/bankDetailCfReading'}>
                            <Button>取消</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionAddCfReading;
