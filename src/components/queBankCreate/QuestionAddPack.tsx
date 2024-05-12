import React from 'react';
import { Input, Button, PageHeader, Alert, message, Select, Radio } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QuestionAddPack.less';
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

class QuestionAddPack extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetailPack',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建题库'}`,
            },
            {
                path: '/questionAddPack',
                breadcrumbName: '新增试题',
            },
        ],
        bankID: '',
        setType: '',
        title: '',
        stem: '',
        selectYear: YEAR_MAP[YEAR_MAP.length - 1],
        selectTp: 'cet4',
        genuine: true,
        options: [
            {
                key: 'A',
                value: '',
            },
            {
                key: 'B',
                value: '',
            },
            {
                key: 'C',
                value: '',
            },
            {
                key: 'D',
                value: '',
            },
            {
                key: 'E',
                value: '',
            },
            {
                key: 'F',
                value: '',
            },
            {
                key: 'G',
                value: '',
            },
            {
                key: 'H',
                value: '',
            },
            {
                key: 'I',
                value: '',
            },
            {
                key: 'J',
                value: '',
            },
            {
                key: 'K',
                value: '',
            },
            {
                key: 'L',
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

    /** 增加输入框 */
    addQuestion() {
        const { options } = this.state;
        this.setState({
            options: [...options, { key: A_Z[options.length + 1], value: '' }],
        });
    }

    /** 保存试题 */
    async saveQuestion() {
        const res = await this.saveQuestionInterface();
        if (res.state === 0) {
            message.success('保存成功');
            setTimeout(() => {
                window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetailPack`;
            }, 200);
        }
    }

    /** 保存接口 */
    async saveQuestionInterface() {
        const { bankID, setType, title, stem, genuine, selectYear, selectTp, options } = this.state;
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
                        options,
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

    render() {
        const { routes, title, stem, selectYear, selectTp, genuine, options } = this.state;
        return (
            <div className="question-add-pack-wrapper">
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
                            <div className="mt-8">题干:</div>
                            <TextArea
                                className="mt-8"
                                value={stem}
                                onChange={this.handleStem.bind(this)}
                                style={{ height: 500, resize: 'none' }}
                            />
                            <div className="tips">
                                *提示：在输入题干文本时，选词的地方用(\选项\)表示； *示例：Let there
                                be (\A\). [假设选项A是"light"]
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
                            <div className="mt-8">选项:</div>
                            <div className="mt-8 option-area">
                                {options.map((val, index) => (
                                    <div className="item">
                                        <span className="title">{val.key}：</span>
                                        <Input
                                            className="gap-8"
                                            value={val.value}
                                            style={{ width: 180 }}
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
                                            style={{ width: '80%' }}
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
                        <Link to={'/app/queBankCreate/bankDetailPack'}>
                            <Button>取消</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionAddPack;
