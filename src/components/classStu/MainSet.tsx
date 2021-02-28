import React from 'react';
// import { Row, Col, Tabs, DatePicker, Table } from 'antd';
// import moment from 'moment';
import { PageHeader, Radio, Select, Button, Tooltip } from 'antd';
import '../../style/pageStyle/MainSet.less';
const { Option } = Select;

const routes = [
    {
        path: '/app/class/main',
        breadcrumbName: '班级和学员管理',
    },
    {
        path: '/class',
        breadcrumbName: '新建班级',
    },
    {
        path: '/set',
        breadcrumbName: '设置学习任务',
    },
];
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
        wordType: 1,
        wordCount: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        wordVal: 9,
        startType: 1,
        wordDb: ['四级词库', '六级词库'],
        dbVal: '四级词库',
        littleType: 1,
        bigType: 1,
        firState: 0,
        secState: 0
    };
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
        this.setState({
            dbVal: value
        });
    }
    saveFir() {
        this.setState({
            firState: 1
        });
    }
    resetFir() {
        this.setState({
            firState: 0,
            wordType: 1,
            wordVal: 9,
            startType: 1,
            dbVal: '四级词库'
        });
    }
    saveSec() {
        this.setState({
            secState: 1
        });
    }
    resetSec() {
        this.setState({
            secState: 0,
            littleType: 1,
            bigType: 1,
        });
    }

    render() {
        const {wordType, wordCount, startType, wordDb, littleType, bigType, wordVal, dbVal, firState, secState} = this.state;
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
                                    <Radio.Group onChange={this.onWordTypeChange.bind(this)} value={wordType}>
                                        <Radio value={1}>学生自定义</Radio>
                                        <Radio value={2}>教师设置</Radio>
                                    </Radio.Group>
                                    <Select
                                        disabled={wordType === 1 ? true : false}
                                        defaultValue={wordVal}
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
                                        状态: <div className="state-co">{wordType === 1 ? '学生自定义' : '教师设置'} {wordType !== 1 ? ` 背词数: ${wordVal} 个` : ''}</div>
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
                                    <Radio.Group onChange={this.onStartTypeChange.bind(this)} value={startType}>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={2}>否</Radio>
                                    </Radio.Group>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">{startType === 1 ? '是' : '否'}</div>
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
                                        style={{ width: 240 }}
                                        onChange={this.handleWordDb.bind(this)}
                                    >
                                        {wordDb.map((item) => (
                                            <Option key={item} value={item}>
                                                {item}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        当前词库: <div className="state-co">{dbVal}</div>
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
                                        <Radio value={1}>展示中文释义选择英文</Radio>
                                        <Radio value={2}>展示英文选择中文释义</Radio>
                                        <Radio value={3}>填空</Radio>
                                        <Radio value={4}>随机</Radio>
                                    </Radio.Group>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">{
                                            littleType === 1 ? 
                                            '展示中文释义选择英文' : 
                                            littleType === 2 ?
                                            '展示英文选择中文释义' :
                                            littleType === 3 ? 
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
                                        <Radio value={1}>暂不开启</Radio>
                                        <Radio value={2}>开启</Radio>
                                    </Radio.Group>
                                </div>
                            ) : 
                            (
                                <div className="sec">
                                    <div>
                                        状态: <div className="state-co">{bigType === 1 ? '暂不开启' : '开启'}</div>
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
