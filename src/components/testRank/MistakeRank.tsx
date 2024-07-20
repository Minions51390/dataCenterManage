import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { get, baseUrl } from '../../service/tools';
import { InfoCircleOutlined } from '@ant-design/icons';
import '../../style/pageStyle/MistakeRank.less';
import cn from 'classnames';
import { Choice, Pack, LongReading, CfReading } from '../questionTableCell';
const { Option } = Select;

const enum QuestionType {
    Choice = 'choice',
    Pack = 'pack',
    LongReading = 'long_reading',
    CfReading = 'cf_reading',
    All = 'all',
}

const getErrorCount = (setType: QuestionType, data: any) => {
    if (setType === QuestionType.Choice) {
        return data.errorCount;
    }

    if (setType === QuestionType.Pack) {
        return data.errorCount.reduce((prev: number, cur: number) => prev + cur);
    }

    if (setType === QuestionType.LongReading || setType === QuestionType.CfReading) {
        return data.questions.reduce((prev: number, cur: any) => prev + cur.errorCount, 0);
    }
}

const getQuestionContent = (setType: QuestionType, data: any) => {
    if (setType === QuestionType.LongReading) {
        return <LongReading data={data} />;
    }

    if (setType === QuestionType.CfReading) {
        return <CfReading data={data} />;
    }

    if (setType === QuestionType.Pack) {
        return <Pack data={data} />;
    }

    if (setType === QuestionType.Choice) {
        return <Choice data={data} />;
    }
};


const QUESTION_LIST = [
    {
        key: QuestionType.All,
        name: '全部'
    },
    {
        key: QuestionType.Choice,
        name: '单选'
    },
    {
        key: QuestionType.Pack,
        name: '词汇理解'
    },
    {
        key: QuestionType.LongReading,
        name: '长篇阅读'
    },
    {
        key: QuestionType.CfReading,
        name: '仔细阅读'
    },
];

const MistakeRank = () => {
    const [list, setList] = useState([]);
    const bici = useRef(sessionStorage.getItem('pici'));
    const paperName = useRef(sessionStorage.getItem('testPaperName'));
    const classList = useRef<{class_id: string, class_name: string}[]>(JSON.parse(sessionStorage.getItem('classList') || '[]') || []);
    const [queryType, setQueryType] = useState('stem');
    const [query, setQuery] = useState('');
    const [pageNum, setPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [selectedClass, setSelectedClass] = useState(classList?.current?.[0]?.class_id);
    const [selectedQuestionType, setSelectedQuestionType] = useState('all');

    const queryTypeList = [
        {
            type: 'stem',
            name: '试题内容',
        },
        {
            type: 'choice',
            name: '选项',
        },
    ];

    const routes = [
        {
            path: '/app/test/testRank',
            breadcrumbName: '考试成绩',
        },
        {
            path: '/stuRank',
            breadcrumbName: `${sessionStorage.getItem('banji')}`,
        },
    ];

    const columns: TableColumnsType<any> = [
        {
            key: 'key',
            dataIndex: 'key',
            title: '序号',
            align: 'center',
        },
        {
            key: 'questionType',
            dataIndex: 'questionType',
            title: '试题类型',
            render: (_: any, record: any) => {
                const item = QUESTION_LIST.find(item => item.key === record.setType);
                return item?.name || '';
            },
            align: 'center',
        },
        {
            key: 'stem',
            dataIndex: 'stem',
            title: '试题内容',
            render: (_: any, record: any) => {
                return getQuestionContent(record.setType, record);
            },
        },
        {
            key: 'errorCount',
            dataIndex: 'errorCount',
            title: '错题人数',
            render: (_: any, record: any) => {
                return getErrorCount(record.setType, record);
            },
            align: 'center',
        },
        {
            key: 'action',
            title: '操作',
            render: (_: any, record: any) => {
                return <Button type="link">详情</Button>
            },
            align: 'center',
        }
    ];

    const getData = useCallback(async () => {
        const params = {
            examId: sessionStorage.getItem('examId'),
            classId: classList?.current?.[0].class_id,
            queryType,
            pageSize,
            pageNo: pageNum,
            query,
        };
        let res = await get({
            url: `${baseUrl}/api/v1/exam/statistics`,
            config: {
                params
            }
        });
        console.log('------------->', res);
        const result = res?.data?.map((item: any, index: number) => ({
            ...item,
            key: index + 1
        }));
        setList(result);
        setTotal(res?.data?.length);
    }, [pageNum, pageSize, query, queryType])

    const handleQueryTypeChange = (v: string) => {
        setQueryType(v);
    }

    const handleQueryChange = (event: any) => {
        setQuery(event.target.value);
    }

    const handleSearch = () => {
        getData();
    }

    const handlePaginationChange = (page: number, pageSize: number = 20) => {
        setPageNum(page);
        setPageSize(pageSize);
    }

    useEffect(() => {
        getData();
    }, [getData, pageNum, pageSize]);


    return (
        <div className="mistake-rank">
            <div className="header">
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className="sec">{paperName?.current}</div>
            </div>
            <div className="body">
                <div className="select">
                    <div className="select-item">
                        <span>学员批次：</span>
                        <span>{bici?.current}</span>
                    </div>
                    <div className="select-item">
                        <span className="span2">班级：</span>
                        <Select
                            style={{ width: 120 }}
                            value={selectedClass}
                            onChange={v => setSelectedClass(v)}
                        >
                            {
                                classList?.current?.map((item: any) => (
                                    <Option value={item.class_id} key={item.class_id}>{item.class_name}</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <div className="select-item">
                        <span className="span2">试题类型：</span>
                        <Select
                            style={{ width: 120 }}
                            value={selectedQuestionType}
                            onChange={v => setSelectedQuestionType(v)}
                        >
                            {
                                QUESTION_LIST.map(item => (
                                    <Option value={item.key} key={item.key}>{item.name}</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <div className={cn('select-item', 'group-select')}>
                        <Tooltip placement="top" title="请选择“试题内容”、“正确选项”或“答案内容”进行模糊搜索">
                            <InfoCircleOutlined style={{ marginRight: 9 }} />
                        </Tooltip>
                        <Input.Group compact>
                            <Select
                                defaultValue={queryType}
                                value={queryType || "请选择"}
                                onChange={handleQueryTypeChange}
                                style={{ width: 120 }}
                            >
                                {
                                    queryTypeList.map((item: any) => (
                                        <Option value={item.type} key={item.type}>{ item.name }</Option>
                                    ))
                                }
                            </Select>
                            <Input
                                style={{ width: '240px' }}
                                placeholder="待输入"
                                value={query}
                                onChange={handleQueryChange}
                            />
                        </Input.Group>
                    </div>
                    <Button
                        className="gap-30"
                        type="primary"
                        onClick={handleSearch}
                        style={{ marginLeft: 16 }}
                    >
                        搜索
                    </Button>
                </div>
                <div className="table">
                    <Table
                        columns={columns}
                        dataSource={list}
                        size={'middle'}
                        bordered={false}
                        pagination={false}
                    />
                </div>
                <div className={list?.length ? 'pag' : 'display-none'}>
                    <Pagination
                        defaultCurrent={1}
                        pageSize={pageSize}
                        current={pageNum}
                        total={total}
                        onChange={handlePaginationChange}
                        showQuickJumper
                        showSizeChanger
                    />
                </div>
            </div>
        </div>
    )
};

export default MistakeRank;