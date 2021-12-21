import React from 'react';
import { Table, Pagination, Input, Button, PageHeader, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import copy from 'clipboard-copy';
import '../../style/pageStyle/TestDetail.less';
// import { get, post, baseUrl } from '../../service/tools';
class TestDetail extends React.Component {
    state = {
        routes: [
            {
                path: '/app/testPaper',
                breadcrumbName: '试卷管理',
            },
            {
                path: '/testDetail',
                breadcrumbName: `${sessionStorage.getItem('testDetailName') || '新建'}试卷`,
            },
        ],
        testQuery: '',
        pageNo: 1,
        allCount: 1,
        /** 默认数据 */
        testPaperID: '',
        testPaperName: sessionStorage.getItem('testDetailName') || '',
        creator: '',
        createTime: '0000-00-00 00:00:00',
        updateTime: '0000-00-00 00:00:00',
        questionCount: '120',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
            },
            {
                title: '试题内容',
                key: 'testName',
                render: (text: any) => (
                    <div className="title">
                        <div className="que">{text.stem}</div>
                        <div className="choose">
                            <div className="tr">
                                <div>
                                    {text.options[0].key}.{text.options[0].value}
                                </div>
                                <div>
                                    {text.options[1].key}.{text.options[1].value}
                                </div>
                            </div>
                            <div className="tr">
                                <div>
                                    {text.options[2].key}.{text.options[2].value}
                                </div>
                                {text.options[3] ? (
                                    <div>
                                        {text.options[3].key}.{text.options[3].value}
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                        <div className="right">正确答案：{text.rightAnswer}</div>
                    </div>
                ),
            },
        ],
        data1: [
            {
                questionID: 'xxxxx',
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
        const testData = await this.getTestData();
        this.setState({ ...testData });
    }
    async getTestData() {
        return {
            testPaperID: '11',
            creator: '老实',
            createTime: '0000-00-00 00:00:00',
            updateTime: '0000-00-00 00:00:00',
            questionCount: '120',
        };
    }

    /** 搜索 */
    ontestQueryChange(event: any) {
        this.setState({
            testQuery: event.target.value,
        });
    }

    /** 更换页码 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
            }
        );
    }

    /** 搜索接口 */
    searchQuery(val: any) {
        const { testQuery } = this.state;
        console.log(testQuery);
    }

    /** 复制函数 */
    copyIdFn(id: any) {
        copy(id)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }

    render() {
        const {
            testPaperID,
            testPaperName,
            testQuery,
            routes,
            columns1,
            data1,
            allCount,
            pageNo,
            creator,
            createTime,
            updateTime,
            questionCount,
        } = this.state;
        return (
            <div className="test-detail-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{testPaperName}</div>
                        <Button onClick={this.copyIdFn.bind(this, testPaperID)}>复制试卷ID</Button>
                    </div>
                    <div className="thr">
                        <div className="tr">
                            <div>
                                创建人：<span>{creator}</span>
                            </div>
                            <div>
                                创建时间：<span>{createTime}</span>
                            </div>
                            <div className="sp">试卷题数</div>
                        </div>
                        <div className="tr">
                            <div>
                                试卷ID：<span>{testPaperID}</span>
                            </div>
                            <div>
                                更新时间：<span>{updateTime}</span>
                            </div>
                            <div className="hard">{questionCount}个</div>
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>试题列表:</div>
                        <div className="right">
                            <Input
                                className="gap-12"
                                style={{ width: 272 }}
                                placeholder="请输入关键词"
                                value={testQuery}
                                onChange={this.ontestQueryChange.bind(this)}
                            />
                            <Button
                                className="gap-12"
                                type="primary"
                                onClick={this.searchQuery.bind(this)}
                            >
                                查询
                            </Button>
                            <div className="gap-40">
                                <Button type="primary" icon={<PlusOutlined />}>
                                    导入
                                </Button>
                                <Button>
                                    批量删除
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="thr">
                        <Table
                            columns={columns1}
                            dataSource={data1}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                        />
                    </div>
                    <div className={data1.length ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            pageSize={20}
                            current={pageNo}
                            total={allCount * 20}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default TestDetail;
