import React, {useRef} from "react";
import { get, post, baseUrl } from '../../service/tools';
import '../../style/pageStyle/ExamDetail.less';
import {
    PageHeader,
    Tabs,
    Button,
    Radio,
    Input,
    InputNumber,
    message,
    Progress,
} from "antd";
import { EditOutlined } from '@ant-design/icons'
import { getQueryString } from '../../utils';
import { spawn } from "child_process";
import { off } from "process";

const { TextArea } = Input;

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


class examDetail extends React.Component {
    state = {
        routes: [
            {
                path: '/app/writing/writingExam',
                breadcrumbName: '已发布作文',
            },
            {
                path: `/examRank?examId=${
                    GetRequest()['examId']
                }`,
                breadcrumbName: `成绩排行`,
            },
            {
                path: '/app/writing/examDetail',
                breadcrumbName: `查看卷面`,
            },
        ],
        paperId: 0,
        stuName: "",
        className: "",
        title: "",
        content: "",
        writing: {
            writingId: 1,
            writingCode: "000032",
            name: "xx",
            desc: "xx",
            title: "xx",
            creator: "xx",
            createTime: "xxxx-xx-xx-xx:xx",
            level: "cet4",
            maximum: 160,
            minimum: 120,
        },
        isSubmit: false, // 是否已提交
        comment: "",
        aiReview: {
                "aiComment": "作者词汇量稍有不足，请注意高级词汇积累；复杂句使用不错，句法规范；文章衔接不够流畅内容逻辑顺畅；作文内容点跟作文要求相去甚远，请注意内容覆盖作文要求。请注意方法，勤加练习。",
                "aiContentScore": 74.85,
                "aiDetectionTimes": 1,
                "aiScore": 59.53,
                "aiSentenceScore": 73.91,
                "aiStructureScore": 38.46,
                "aiVocabularyScore": 58.93,
                "aiSentenceComments": [
                    {
                        "sentence": "That is my grandfather's traditional Chinese medicine pharmacy, affectionately referred to by patients as the 'apricot forest'.",
                        "suggestions": [
                            {
                                "errBaseInfo":"xxxxxxxx错了，需要改成xxxx",
                                "startPos":22,
                                "endPos": 28,
                                "correctChunk":"xxx",
                                "orgChunk":"xxxxxxx",
                                "key": -1,
                                "showType" : 2,
                            }
                        ]
                    },
                    {
                        "sentence": "I can feel as if there is an apricot forest behind this pharmacy, shining brightly under the sunlight.",
                        "suggestions": [
                            {
                                "errBaseInfo":"xxxxxxxx错了，需要改成xxxx",
                                "startPos":22,
                                "endPos": 28,
                                "correctChunk":"xxx",
                                "orgChunk":"xxxxxxx",
                                "key": -1,
                                "showType" : 2,
                            }
                        ]
                    },
                    {
                        "sentence": "Grandfather said, \"This is saving people, and it's also saving oneself\".",
                        "suggestions": [
                            {
                                "errBaseInfo":"xxxxxxxx错了，需要改成xxxx",
                                "startPos":22,
                                "endPos": 28,
                                "correctChunk":"xxx",
                                "orgChunk":"xxxxxxx",
                                "key": -1,
                                "showType" : 2,
                            }
                        ]
                    },
                    {
                        "sentence": "I think this medicine juice, which is boiled into three mouthfuls with three bowls of water, is exactly where the precious essence of Chinese medicine lies: redemption and self redemption",
                        "suggestions": [
                            {
                                "errBaseInfo":"xxxxxxxx错了，需要改成xxxx",
                                "startPos":22,
                                "endPos": 28,
                                "correctChunk":"xxx",
                                "orgChunk":"xxxxxxx",
                                "key": -1,
                                "showType" : 2,
                            }
                        ]
                    }
                ]
            },
        score: 0, // -1 为未考试
        examType: "", // practice
        submitTimes: 1, // 提交次数
        fontSize: 14,
        editStatus: false,
        errorKey: 0,
        errorKeywords:['|'],
        errorSuggestions: [{key:0, showType: 0}],
    };

    componentWillMount() {
        this.inited();
    }
    errorItemRef:any;
    errorWritingRef:any;
    // 初始化
    inited() {
        this.getWritingDetail();
    }
    
    // 作文标题修改
    handleTitleChange(event:any) {
        this.setState({
            title: event.target.value,
        });
    }

    // 作文正文修改
    handleCommentChange(event:any) {
        this.setState({
            comment: event.target.value,
        });
    }
    
    // 字体大小修改
    onFontSizeChange(event:any){
        this.setState({
            fontSize: event.target.value,
        });
    }

    // 评语/成绩 编辑点击
    handleEditClick(){
        const { editStatus } = this.state ;
        this.setState({
            editStatus: !editStatus,
        });
    }
    // 作文文章中鼠标点击错误
    handleWritingErrorClick(event:any){
        this.setState({
            errorKey: event?.key,
        });
        this.errorItemRef.childNodes[event?.key].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    }

    //错误项列表点击
    handleErrorListItemClick(event:any){
        this.setState({
            errorKey: event?.key,
        });
        this.errorWritingRef.childNodes[event?.key].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    }

    // 作文成绩修改
    handleScoreChange(val:any) {
        this.setState({
            score: val,
        });
    }

    //成绩发布
    async handlePublishGrades(val:any){
        const { paperId, comment, score } = this.state
        let res = await post({
            url: `${baseUrl}/api/v1/writing-exam/result/teacher-review`,
            data: {
                paperId,
                score,
                comment: comment, 
            }
        });
        if(res){
            message.success(`发布成功`);
        }else{
            message.error(`删除任务失败:${res.msg}`);
        }
    }

    // 获取作文内容
    async getWritingDetail() {
    const query = getQueryString();
    const paperId = +(query?.paperId ?? 0);
        const res = await get({
            url: `${baseUrl}/api/v1/writing-exam/result/detail?paperId=${paperId}`
        })
        if(res){
            let aiReview = res?.data?.aiReview;
            let errorKeywords:any = [];
            let errorSuggestions:any = [];
            aiReview.aiSentenceComments.forEach((aiSentenceComment:any, index:any) => {
                aiSentenceComment.suggestions.forEach((suggestion:any, index:any)=>{
                    suggestion.relStartPos = suggestion.startPos + aiSentenceComment.sentStartPos;
                    errorKeywords.push(`|${suggestion.orgChunk}`);
                    errorSuggestions.push(suggestion);
                })
            });
            this.setState({
                paperId: paperId,
                writing: res?.data?.writingBaseInfo,
                title: res?.data?.writingAnswer?.title,
                content: res?.data?.writingAnswer?.content,
                aiReview,
                comment: res?.data?.comment || res?.data?.aiReview?.aiComment,
                examType: res?.data?.examType,
                isSubmit: res?.data?.isSubmit, // 是否已提交
                stuName: res?.data?.stuName,
                className: res?.data?.className,
                score: res?.data?.score,
                errorSuggestions,
                errorKeywords,
            });
        }else{
            message.error("获取作文失败!");
        }
    }

    // 计算文本长度
    computedTextCount(str:any) {
        let value = str;
        // 替换中文字符为空格
        value = value.replace(/[\u4e00-\u9fa5]+/g, " ");
        // 将换行符，前后空格不计算为单词数
        value = value.replace(/\n|\r|^\s+|\s+$/gi, "");
        // 多个空格替换成一个空格
        value = value.replace(/\s+/gi, " ");
        // 更新计数
        let length = 0;
        let match = value.match(/\s/g);
        if (match) {
            length = match.length + 1;
        } else if (value) {
            length = 1;
        }
        return length;
    }
    // 获取带错误格式的文章
    getFinalContent(){
        const {errorKey, errorSuggestions, errorKeywords, content} = this.state
        let contentStr = content;
        function splitByMultipleValues(str:any, separators:any) {
            if (separators.length === 0) {
                return [str];
            }
            const firstSeparator = separators.shift();
            return str.split(firstSeparator).reduce((result:any, part:any) => {
                return result.concat(splitByMultipleValues(part, separators.slice()));
            }, []);
        }
        errorSuggestions.forEach((suggestion:any, index:any)=>{
            suggestion.key = index;
            const pos = suggestion.relStartPos + index;
            contentStr = `${contentStr.slice(0, pos)}|${contentStr.slice(pos)}`;
        })
        const contentSplits = splitByMultipleValues(contentStr, [...errorKeywords]);
        return (
            contentSplits.map((contentSplit:any, index:any)=>{
                return (
                    <span>
                        <span>{contentSplit}</span>
                        <span
                            className={[
                                'content-error-suggestions',
                                errorSuggestions[index]?.showType === 2 ? 
                                    errorKey === errorSuggestions[index]?.key ? 
                                        'content-suggestion-mouseover' : 'content-suggestion'
                                : errorKey === errorSuggestions[index]?.key ? 
                                        'content-error-mouseover' : 'content-error'
                            ].join(' ')}
                            onClick={this.handleWritingErrorClick.bind(this, errorSuggestions[index])}
                        >{errorKeywords[index] && errorKeywords[index].replace('|', '')}</span>
                        {
                            index === errorSuggestions.length - 1 ? <span>{contentSplits[contentSplits.length - 1]}</span> :''
                        }
                    </span>
                )
            })
        )
    }
    
    errorItem() {
        const { aiReview, errorKey } = this.state;
        return (
            <div ref={(ele) => (this.errorItemRef = ele)}>
            {aiReview.aiSentenceComments.map((aiSentenceComment) => {
                return aiSentenceComment.suggestions.map((suggestion) => {
                    return (
                        <div
                            className={[
                                "list-item",
                                suggestion.showType === 2 ? "suggestion-item" : "error-item",
                                suggestion.key === errorKey ? 
                                    suggestion.showType === 2 ? "suggestion-item-select" : "error-item-select"
                                : ""
                            ].join(' ')}
                            onClick={this.handleErrorListItemClick.bind(this, suggestion)}
                        >
                            <span className="error-item-count" />
                            <div className="error-text">{suggestion.orgChunk}: {suggestion.errBaseInfo}</div>
                        </div>
                    );
                })
            })}
            </div>
        );
    }
    render() {
        const { paperId, routes, title, content, writing, comment, errorSuggestions, className, stuName, score, editStatus, fontSize } = this.state;
        return (
            <div className="writing-detail-container">
            <div className="header">
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className="sec">
                    <div className="text">{`${className}-${stuName}`}</div>
                    <Button type="primary" onClick={this.handlePublishGrades.bind(this, paperId)}>发布成绩</Button>
                </div>
            </div>
            <div className="writing-detail">
                <div className="detail-content">
                <div className="content-left">
                    <div className="left-fir">
                        <div className="fir-word-num">
                            词数统计：{this.computedTextCount(content)}词
                        </div>
                        <Radio.Group 
                            buttonStyle="solid" 
                            onChange={this.onFontSizeChange.bind(this)}
                            defaultValue="14"
                        >
                            <Radio.Button value={'12'}>小</Radio.Button>
                            <Radio.Button value={'14'}>中</Radio.Button>
                            <Radio.Button value={'16'}>大</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div className="left-sec" style={{fontSize: `${fontSize}px`, lineHeight: `${1.5 * fontSize}px`}}>
                        <div className="writing-title">{title}</div>
                    </div>
                    <div className="left-thr" style={{fontSize: `${fontSize}px`, lineHeight: `${1.5 * fontSize}px`}}>
                        <div className="writing-content" ref={(ele) => (this.errorWritingRef = ele)}>
                            {this.getFinalContent()}
                        </div>
                    </div>
                </div>
                <div className="content-right">
                    <div className="content-tab">
                    <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="评语" key="1">
                            <div className="content-demand-commit">
                            <div className="commit-left">
                                <div className="left-box1">
                                    <div className="box1">
                                        <div className="box-text1">分数：</div>
                                        {
                                            editStatus ? (
                                                <InputNumber min={0} max={100} value={score} onChange={this.handleScoreChange.bind(this)} />
                                            ) : (
                                                <div>{score}</div>
                                            )
                                        }
                                    </div>
                                    <Button icon={<EditOutlined />} onClick={this.handleEditClick.bind(this)}>{editStatus?'保存':'编辑'}</Button>
                                </div>
                                <div className="left-box2">
                                    <div className="box-text2">评语：</div>
                                    {
                                        editStatus ? (
                                            <TextArea
                                                size="middle"
                                                value={comment}
                                                bordered={false}
                                                onChange={this.handleCommentChange.bind(this)}
                                            />
                                        ) : (
                                            <div>{comment}</div>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="pp">
                                <Progress
                                    type="dashboard"
                                    percent={score || 0}
                                    format={(percent) => `${percent}`}
                                />
                            </div>
                            </div>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="写作要求" key="2">
                        <div className="content-demand">
                            <div className="demand-fir">
                            <div className="demand-level">
                                <span className="demand-sec">作文等级：</span>
                                {writing.level}
                            </div>
                            <div className="demand-num">
                                <span className="demand-sec">词数限制：</span>
                                {writing.minimum}-{writing.maximum}
                            </div>
                            </div>
                            <div className="demand-title">
                            <span className="demand-sec">作文标题：</span>
                            {writing.title}
                            </div>
                            <div className="demand-desc">
                            <span className="demand-sec">写作要求：</span>
                                {writing.desc}
                            </div>
                        </div>
                        </Tabs.TabPane>
                    </Tabs>
                    </div>
                    <div className="commit-error">
                    <div className="fir-line">
                    <div className="title">AI纠错</div>
                    <div className="count">{errorSuggestions.length}</div>
                    </div>
                    <div className="error-content">{this.errorItem()}</div>
                </div>
                </div>
                </div>
            </div>
            </div>
        );
    }
}
export default examDetail;
