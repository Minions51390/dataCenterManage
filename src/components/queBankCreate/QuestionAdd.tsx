import React from 'react';
import { Table, Pagination, Input, Button, Modal, PageHeader, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/QuestionAdd.less';
// import { get, post, baseUrl } from '../../service/tools';
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
            bankID: GetRequest()['classId'],
        });
    }

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
                                            // value={queNameB}
                                            // onChange={this.onQueNameChangeB.bind(this)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">A：</span>
                                        <Input
                                            className="gap-8"
                                            // value={queNameB}
                                            // onChange={this.onQueNameChangeB.bind(this)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">B：</span>
                                        <Input
                                            className="gap-8"
                                            // value={queNameB}
                                            // onChange={this.onQueNameChangeB.bind(this)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">C：</span>
                                        <Input
                                            className="gap-8"
                                            // value={queNameB}
                                            // onChange={this.onQueNameChangeB.bind(this)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">D：</span>
                                        <Input
                                            className="gap-8"
                                            // value={queNameB}
                                            // onChange={this.onQueNameChangeB.bind(this)}
                                        />
                                    </div>
                                    <div className="area">
                                        <span className="title">正确选项：</span>
                                        <Input
                                            className="gap-8"
                                            // value={queNameB}
                                            // onChange={this.onQueNameChangeB.bind(this)}
                                        />
                                    </div>
                                </div>
                                <div className="del">删除试题</div>
                            </div>
                        ))}
                    </div>
                    <div className="add" onClick={this.addQuestion.bind(this)}>
                        <Button type="dashed" icon={<PlusOutlined />}>
                            添加
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionAdd;
