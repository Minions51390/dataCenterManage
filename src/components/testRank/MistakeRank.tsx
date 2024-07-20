import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { get, baseUrl } from '../../service/tools';
import { InfoCircleOutlined } from '@ant-design/icons';
import '../../style/pageStyle/MistakeRank.less';
import cn from 'classnames';
import { Choice, Pack, LongReading, CfReading } from '../questionTableCell';
import { useLocation } from 'react-router-dom';
import { ReactComponent as GenuineSvg } from '../../assets/svg/genuine.svg';
import qs from 'qs';
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

const getTextForFilter = (data: any) => {
    let stemForFilter = data.stem;
    let optionsForFilter = '';
    if (data.setType === QuestionType.LongReading) {
        stemForFilter = data.questions.map((item: any) => item.qStem).join('');
    }

    if (data.setType === QuestionType.Choice) {
        optionsForFilter = data.options.map((item: any) => item.value).join('');
    }
    return {
        stem: stemForFilter.replace(/\\([A-Z]*\\)/g, ' '),
        choice: optionsForFilter,
    };
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
    const [queryType, setQueryType] = useState('stem');
    const [query, setQuery] = useState('');
    const [pageNum, setPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [selectedBatch, setSelectedBatch] = useState<number>();
    const [selectedClass, setSelectedClass] = useState<number>();
    const [selectedQuestionType, setSelectedQuestionType] = useState(QuestionType.All);
    const [batchList, setBatchList] = useState<any[]>([]);
    const [examName, setExamName] = useState('');
    const [filteredList, setFilteredList] = useState<any[]>([]);

    const location = useLocation();
    const examId = qs.parse(location.search.slice(1)).examId;

    const init = async () => {
        let { data } = await get({
            url: `${baseUrl}/api/v1/exam/batch-class`,
            config: {
                params: {
                    examId
                }
            }
        });
        const { batchClass, examName } = data;
        setExamName(examName);
        setBatchList(batchClass);
        setSelectedBatch(batchClass?.[0]?.batchId);
        setSelectedClass(batchClass?.[0]?.classes?.[0]?.classId);
    }

    const classList = useMemo(() => {
        return batchList?.find(item => item.batchId === selectedBatch)?.classes || [];
    }, [batchList, selectedBatch]);

    const handleBatchChange = (batchId: number) => {
        setSelectedBatch(batchId);
        setSelectedClass(batchList?.find(item => item.batchId === batchId)?.classes?.[0]?.classId);
    }

    useEffect(() => {
        init();
    }, []);

    const queryTypeList = [
        {
            type: 'stem',
            name: '试题内容',
        },
        {
            type: 'choice',
            name: '选项',
            disabled: selectedQuestionType !== QuestionType.Choice
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
            render: (index: any, record: any) => {
                if (record.genuine) {
                    return (
                        <div style={{ display: 'flex' }}>
                            <GenuineSvg />
                            {index}
                        </div>
                    );
                }
                return index;
            },
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
            examId,
            classId: selectedClass,
        };
        let res = await get({
            url: `${baseUrl}/api/v1/exam/statistics`,
            config: {
                params
            }
        });
        const result = res?.data?.map((item: any, index: number) => ({
            ...item,
            key: index + 1,
            textForFilter: getTextForFilter(item),
        }));
        console.log('result', result);
        setList(result);
        setFilteredList(result);
        setTotal(res?.data?.length);
        setQueryType('stem');
        setQuery('');
    }, [selectedClass, examId]);

    useEffect(() => {
        if (selectedClass) {
            getData();
        }
    }, [selectedClass, getData]);

    const handleQueryTypeChange = (v: string) => {
        setQueryType(v);
    }

    const handleQueryChange = (event: any) => {
        setQuery(event.target.value);
    }

    const handleSearch = () => {
        if (queryType === 'stem') {
            const filterRes = list.filter((item: any) => {
                return item.textForFilter.stem.includes(query);
            });
            setFilteredList(filterRes);
        } else {
            const filterRes = list.filter((item: any) => {
                return item.textForFilter.choice.includes(query);
            });
            setFilteredList(filterRes);
        }
    }

    const handlePaginationChange = (page: number, pageSize: number = 20) => {
        setPageNum(page);
        setPageSize(pageSize);
    }

    const handleQuestionTypeChange = (type: QuestionType) => {
        setSelectedQuestionType(type);
        if (type !== QuestionType.Choice) {
            setQueryType('stem');
        }
    }


    return (
        <div className="mistake-rank">
            <div className="header">
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className="sec">{examName}-错题排行</div>
            </div>
            <div className="body">
                <div className="select">
                    <div className="select-item">
                        <span>学员批次：</span>
                        <Select
                            style={{ width: 120 }}
                            value={selectedBatch}
                            onChange={handleBatchChange}
                        >
                            {
                                batchList?.map((item: any) => (
                                    <Option value={item.batchId} key={item.batchId}>{item.describe}</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <div className="select-item">
                        <span className="span2">班级：</span>
                        <Select
                            style={{ width: 120 }}
                            value={selectedClass}
                            onChange={v => setSelectedClass(v)}
                        >
                            {
                                classList?.map((item: any) => (
                                    <Option value={item.classId} key={item.classId}>{item.describe}</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <div className="select-item">
                        <span className="span2">试题类型：</span>
                        <Select
                            style={{ width: 120 }}
                            value={selectedQuestionType}
                            onChange={handleQuestionTypeChange}
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
                                        <Option disabled={item.disabled} value={item.type} key={item.type}>{ item.name }</Option>
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
                        dataSource={filteredList}
                        size={'middle'}
                        bordered={false}
                        pagination={false}
                    />
                </div>
                <div className={filteredList?.length ? 'pag' : 'display-none'}>
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