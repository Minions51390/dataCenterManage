import React, { useEffect, useState } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip, Divider, Skeleton } from 'antd';
import { get, baseUrl } from '../../service/tools';
import '../../style/pageStyle/StuPaperDetail.less';

import cn from 'classnames';

const { Option } = Select;

interface Props {
    query: any
}

const StuPaperDetail = ({ query }: Props) => {
    const [list, setList] = useState([]);
    const [bici, setBici] = useState(() => sessionStorage.getItem('pici'));
    const [banji, setBanji] = useState(() => sessionStorage.getItem('banji'));
    const [paperName, setPaperName] = useState(() => sessionStorage.getItem('testPaperName'));
    const [queryType, setQueryType] = useState('all');
    const [pageNo, setPageNo] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);

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
            title: '选项(绿色为正确选项，红色为错选)',
            render: (text: any[], record: any) => {
                const arr: any[] = [];
                text.forEach(item => {
                    arr.push(
                        <div
                            className={cn({
                                right: item.key === record.rightKey && record.choiceAnswer === item.key,
                                error: record.choiceAnswer === item.key && item.key !== record.rightKey,
                            }, 'option-item')}
                        >
                            {item.key}: {item.value}
                        </div>);
                })
                return new Array(Math.round(arr.length / 2)).fill('').map((item, index) => {
                    return <div className="option-line">{arr.slice(index * 2, index * 2 + 2)}</div>;
                });
            }
        },
        {
            key: 'result',
            dataIndex: 'result',
            title: '判定',
            render: (text: string, record: any) => record.rightKey === record.choiceAnswer ? '正确' : '错误'
        },
    ];

    const getData = async () => {
        const params = {
            rollID: query?.roleID,
            queryType,
            pageSize,
            pageNo: pageNo,
        };
        let res = await get({
            url: `${baseUrl}/api/testPaperResult/detail`,
            config: {
                params
            }
        });
        console.log('------------->', res);
        const result = (res?.data?.answerList)?.map((item: any, index: number) => ({
            ...item,
            key: index + 1
        }));
        setList(result);
        setTotal(res?.data?.totalCount);
    }

    const handleSelectChange = (v: string) => {
        setQueryType(v);
    }

    const handlePaginationChange = (page: number, pageSize: number = 20) => {
        setPageNo(page);
        setPageSize(pageSize);
    }

    useEffect(() => {
        getData();
    }, [queryType, pageNo, pageSize, getData]);
    return (
        <div className="stu-paper-detail">
            <div className="header">
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className="sec">{paperName}</div>
            </div>
            <div className="body">
                <div className="top">
                    <span className="span">{bici}/{banji}/{query.name}</span>
                    <div className="select">
                        <div>筛选：</div>
                        <Select style={{ width: 270 }} value={queryType} onChange={handleSelectChange}>
                            <Option value="all">全部</Option>
                            <Option value="error">只看错题</Option>
                        </Select>
                    </div>
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
                        current={pageNo}
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

export default StuPaperDetail;