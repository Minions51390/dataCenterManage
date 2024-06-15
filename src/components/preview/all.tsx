import React from 'react';
import { Table, Pagination, Input, Button, Select, Modal, message, Tooltip } from 'antd';
import '../../style/pageStyle/AllPreview.less';
import { get, post, baseUrl } from '../../service/tools';

const BankType = {
    choice: 'choice',
    pack: 'pack',
    long_reading: 'long_reading',
    cf_reading: 'cf_reading',
};

interface IProps {
    testPaperID: any;
}

class PreviewAll extends React.Component<IProps> {
    state = {
        paperData: {
            part: [],
        },
    };

    componentWillMount() {
        this.fetchTextPaper();
    }

    /** 获取试题 */
    async fetchTextPaper() {
        const { testPaperID } = this.props;
        let res = await get({
            url: `${baseUrl}/api/v1/question-paper/paper-preview?questionPaperId=${testPaperID}`,
        });
        console.log(123123123, res.data);
        this.setState({
            paperData: res.data,
        });
    }

    /** 文章内容type=choice */
    renderSectionChoice(data: any) {
        return (
            <div className="sectionChoice">
                <div className="sectionMain">
                    <div className="directions">{data.directions}</div>
                    <div className="paper">( ) {data.article}</div>
                </div>
                <div className="sectionRes">
                    {data.answers.map((item: any) => {
                        return (
                            <div className="answer">
                                <span style={{ marginRight: '8px' }}>{item.key})</span>
                                {item.value}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /** 文章内容type=pack */
    renderSectionTypeOne(data: any) {
        return (
            <div className="sectionBlock">
                <div className="sectionMain">
                    <div id={`#${data.sectionName}`} className="title">
                        {data.sectionName}
                    </div>
                    <div className="directions">{data.directions}</div>
                    <div className="paper">{data.article}</div>
                </div>
                <div className="sectionRes">
                    <div className="sectionPos">
                        {data.answers.map((item: any) => {
                            return <div className="answer">{`${item.key}）${item.value}`}</div>;
                        })}
                    </div>
                </div>
            </div>
        );
    }

    /** 文章内容type=cf_reading */
    renderSectionTypeTwo(data: any) {
        return (
            <div className="sectionBlock">
                <div className="sectionMain">
                    <div id={`#${data.sectionName}`} className="title">
                        {data.sectionName}
                    </div>
                    <div className="directions">{data.directions}</div>
                    <div className="paper">{data.article}</div>
                </div>
                <div className="sectionRes">
                    <div className="sectionPos">
                        {data.questions.map((item: any, index: number) => {
                            return (
                                <div key={index}>
                                    <div className="question">（ ）{item.question}</div>
                                    <div className="questionAnswer">
                                        {item.answers.map((value: any, number: number) => {
                                            return (
                                                <div
                                                    key={number}
                                                    className="answerItem"
                                                >{`${value.key}）${value.value}`}</div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    /** 文章内容type=long_reading */
    renderSectionTypeThree(data: any) {
        return (
            <div className="sectionBlock">
                <div className="sectionMain">
                    <div id={`#${data.sectionName}`} className="title">
                        {data.sectionName}
                    </div>
                    <div className="directions">{data.directions}</div>
                    <div className="paper">
                        {data.answers.map((item: any, index: number) => {
                            return <div className="answer">{`${item.key}）${item.value}`}</div>;
                        })}
                    </div>
                </div>
                <div className="sectionRes">
                    <div className="sectionPos">
                        {data.questions.map((item: any, index: number) => {
                            return (
                                <div key={index} className="answer">
                                    （ ）{item}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    /** 文章内容 */
    renderMain() {
        const {
            paperData: { part = [] },
        } = this.state;
        return (
            <>
                {part.map((item: any) => {
                    return (
                        <div className="mainItem">
                            <div className="titleBlock">
                                <div id={`#${item.partName}`} className="name">
                                    {item.partName}
                                </div>
                                <div className="title">{item.title}</div>
                            </div>
                            <div className="section">
                                {item.section.map((data: any) => {
                                    if (data.type === BankType['pack']) {
                                        return this.renderSectionTypeOne(data);
                                    } else if (data.type === BankType['cf_reading']) {
                                        return this.renderSectionTypeTwo(data);
                                    } else if (data.type === BankType['long_reading']) {
                                        return this.renderSectionTypeThree(data);
                                    } else {
                                        return this.renderSectionChoice(data);
                                    }
                                })}
                            </div>
                        </div>
                    );
                })}
            </>
        );
    }

    render() {
        return (
            <div className="preview-all">
                <div className="main">{this.renderMain()}</div>
            </div>
        );
    }
}

export default PreviewAll;
