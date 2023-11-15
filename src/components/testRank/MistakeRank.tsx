import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip } from 'antd';
import { get, baseUrl } from '../../service/tools';
import { InfoCircleOutlined } from '@ant-design/icons';
import '../../style/pageStyle/MistakeRank.less';
import cn from 'classnames';
const { Option } = Select;



interface Props {
}

const MistakeRank = ({}: Props) => {
    const [list, setList] = useState([]);
    const [bici, setBici] = useState(() => sessionStorage.getItem('pici'));
    const [banji, setBanji] = useState(() => sessionStorage.getItem('banji'));
    const [paperName, setPaperName] = useState(() => sessionStorage.getItem('testPaperName'));
    const [queryType, setQueryType] = useState('stem');
    const [query, setQuery] = useState('');
    const [pageNum, setPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const queryTypeList = [
        {
            type: 'stem',
            name: '试题内容',
        },
        {
            type: 'choice',
            name: '正确选项',
        },
        {
            type: 'solution',
            name: '答案内容',
        }
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

    const columns = [
        {
            key: 'key',
            dataIndex: 'key',
            title: '序号',
        },
        {
            key: 'stem',
            dataIndex: 'stem',
            title: '试题内容'
        },
        {
            key: 'options',
            dataIndex: 'options',
            title: '答案内容',
            width: 240,
            render: (text: any[]) => {
                const arr: any[] = [];
                text.forEach(item => {
                    arr.push(<div className="option-item">{item.key}: {item.value}</div>);
                })
                return new Array(Math.round(arr.length / 2)).fill('').map((item, index) => {
                    return <div className="option-line">{arr.slice(index * 2, index * 2 + 2)}</div>;
                });
            }
        },
        {
            key: 'rightKey',
            dataIndex: 'rightKey',
            title: '正确选项',
            width: 100,
            render: (text: string) => `正确答案：${text}`
        },
        {
            key: 'errorCount',
            dataIndex: 'errorCount',
            title: '错题人数'
        },
    ];

    const getData = useCallback(async () => {
        const params = {
            examId: sessionStorage.getItem('examId'),
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
        const result = res?.data?.questionList?.map((item: any, index: number) => ({
            ...item,
            key: index + 1
        }));
        setList(result);
        setTotal(res?.data?.totalCount);
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
                <div className="sec">{paperName}</div>
            </div>
            <div className="body">
                <div className="select">
                    <div className="select-item">
                        <span>学员批次：</span>
                        <span>{bici}</span>
                    </div>
                    <div className="select-item">
                        <span className="span2">班级:</span>
                        <span>{banji}</span>
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