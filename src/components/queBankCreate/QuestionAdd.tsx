import React from 'react';
import { Input, Button, PageHeader, Alert, message } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QuestionAdd.less';
import { get, post, baseUrl } from '../../service/tools';
const { TextArea } = Input;
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
class QuestionAdd extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '题库建设',
            },
            {
                path: '/bankDetail',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建题库'}`,
            },
            {
                path: '/questionAdd',
                breadcrumbName: '新增试题',
            },
        ],
        bankID: '',
        questionArr: [
            {
                stem: 'xxxxxxx_____xxxxxx____xxxx',
                options: [
                    {
                        key: 'A',
                        value: 'xxxx',
                    },
                    {
                        key: 'B',
                        value: 'xxxx',
                    },
                    {
                        key: 'C',
                        value: 'xxxx',
                    },
                    {
                        key: 'D',
                        value: 'xxxx',
                    },
                ],
                rightAnswer: 'A',
            },
        ],
    };
    componentWillMount() {
        this.inited();
    }

    async inited() {
        this.setState({
            bankID: GetRequest()['bankID'],
        });
    }

    /** 增加输入框 */
    addQuestion() {
        const { questionArr } = this.state;
        const item = {
            stem: 'xxxxxxx_____xxxxxx____xxxx',
            options: [
                {
                    key: 'A',
                    value: 'xxxx',
                },
                {
                    key: 'B',
                    value: 'xxxx',
                },
                {
                    key: 'C',
                    value: 'xxxx',
                },
                {
                    key: 'D',
                    value: 'xxxx',
                },
            ],
            rightAnswer: 'A',
        };
        this.setState({
            questionArr: [...questionArr, item],
        });
    }

    /** 保存试题 */
    async saveQuestion() {
        await this.saveQuestionInterface();
        message.success('保存成功');
        setTimeout(() => {
            window.location.href = `${window.location.pathname}#/app/queBankCreate/bankDetail`;
        }, 200);
    }

    /** 保存接口 */
    async saveQuestionInterface() {
        const { bankID, questionArr } = this.state;
        const response: any = await post({
            url: baseUrl + '/api/v1/question-set/question',
            data: {
                bankID,
                questionList: questionArr,
            },
        });
        return response;
    }

    /** 更新试题 */
    updateInput(val: any, index: number, type: string, key: number, event: any) {
        const { questionArr } = this.state;
        const valData = event.target.value;
        if (type === "stem") {
            questionArr[index].stem = valData;
        } else if (type === "options") {
            questionArr[index].options[key].value = valData;
        } else if (type === "rightAnswer") {
            questionArr[index].rightAnswer = valData;
        }
        this.setState({
            questionArr,
        });
    }

    /** 删除试题 */
    delQuestion(index: number) {
        const { questionArr } = this.state;
        questionArr.splice(index, 1)
        this.setState({
            questionArr,
        });
    }

    render() {
        const { routes, questionArr } = this.state;
        return (
            <div className="question-add-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">新增试题</div>
                    </div>
                </div>
                <div className="body">
                    <div className="fir">
                        <Alert
                            message="按“Tab”键可切换输入框，或添加新的试题；如果只有3个选项，则“D选项”输入框不需要输入内容；“正确选项”不区分大小写。"
                            type="info"
                            showIcon
                        />
                    </div>
                    <div className="content">
                        {questionArr.map((val, index) => (
                            <div className="item">
                                <div className="num">{index + 1}.</div>
                                <div className="con">
                                    <div className="area">
                                        <span className="title">题干：</span>
                                        <TextArea
                                            className="gap-8"
                                            value={val.stem}
                                            onChange={this.updateInput.bind(this, val, index, "stem", 0)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">A：</span>
                                        <Input
                                            className="gap-8"
                                            value={val.options[0].value}
                                            onChange={this.updateInput.bind(this, val, index, "options", 0)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">B：</span>
                                        <Input
                                            className="gap-8"
                                            value={val.options[1].value}
                                            onChange={this.updateInput.bind(this, val, index, "options", 1)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">C：</span>
                                        <Input
                                            className="gap-8"
                                            value={val.options[2].value}
                                            onChange={this.updateInput.bind(this, val, index, "options", 2)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">D：</span>
                                        <Input
                                            className="gap-8"
                                            value={val.options[3].value}
                                            onChange={this.updateInput.bind(this, val, index, "options", 3)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">正确选项：</span>
                                        <Input
                                            className="gap-8"
                                            value={val.rightAnswer}
                                            onChange={this.updateInput.bind(this, val, index, "rightAnswer", 0)}
                                        />
                                    </div>
                                </div>
                                <div className="del" onClick={this.delQuestion.bind(this, index)}>删除试题</div>
                            </div>
                        ))}
                    </div>
                    <div className="add" onClick={this.addQuestion.bind(this)}>
                        <Button type="dashed" icon={<PlusOutlined />}>
                            添加
                        </Button>
                    </div>
                    <div className="tools">
                        <Button type="primary" onClick={this.saveQuestion.bind(this)}>保存</Button>
                        <Link to={"/app/queBankCreate/bankDetail"}>
                            <Button>取消</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionAdd;
