import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip, Divider, Skeleton } from 'antd';
import { get, baseUrl } from '../../service/tools';
import '../../style/pageStyle/StuPaperDetail.less';
import { useLocation } from 'react-router-dom';
import cn from 'classnames';
import qs from 'qs';

const { Option } = Select;

interface Props {
    query: any,
}

const StuPaperDetail = ({ query }: Props) => {
    const [list, setList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [selectedExamPaperId, setSelectedExamPaperId] = useState<Number>(Number(query?.examPaperId));
    const [paperName, setPaperName] = useState(() => sessionStorage.getItem('testPaperName'));
    const [queryType, setQueryType] = useState('all');
    const [pageNo, setPageNo] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const location = useLocation();
    const {batchId, classId, examId, examPaperId } = query

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
                                right: item.key === record.rightKey,
                                error: record.choiceKey === item.key && item.key !== record.rightKey,
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
            render: (text: string, record: any) => record.rightKey === record.choiceKey ? '正确' : '错误'
        },
        {
            key: 'operation',
            dataIndex: 'operation',
            title: '操作',
            render: (text: string, record: any) => <div onClick={(record) => showDetail(record)}>详情</div>
        },
    ];

    const init = async () => {
        getStudentList();
    }

    const showDetail = (record: any) => {
        console.log(record);
    };

    const getData = async () => {
        const params = {
            examPaperId: query?.examPaperId,
            queryType,
            pageSize,
            pageNo: pageNo,
        };
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/question/list`,
            config: {
                params
            }
        });
        console.log('------------->', res);
        const result = (res?.data?.questionList)?.map((item: any, index: number) => ({
            ...item,
            key: index + 1
        }));
        setList(result);
        setTotal(res?.data?.totalCount);
    }
    // 获取学生列表
    const getStudentList = useCallback(async () => {
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/list?pageSize=99999&pageNo=1&examId=${examId}&batchId=${batchId}&classId=${classId}&query=${query.query}`,
        });
        console.log('res', res)
        setStudentList(res?.data?.examPaperList)
    }, [selectedExamPaperId])
    const handleSelectedStudenChange = (examPaperId: Number) => {
        setSelectedExamPaperId(examPaperId);
    }
    const handleSelectChange = (v: string) => {
        setQueryType(v);
    }

    const handlePaginationChange = (page: number, pageSize: number = 20) => {
        setPageNo(page);
        setPageSize(pageSize);
    }
    useEffect(()=>{
        init();
    }, [examPaperId])
    // useEffect(() => {
    //     getData();
    // }, [queryType, pageNo, pageSize]);
    return (
        <div className="stu-paper-detail">
            <div className="header">
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className="sec">{paperName}</div>
            </div>
            <div className="body">
                <div className="top">
                    {/* <span className="span">{bici}/{banji}/{query.name}</span> */}
                    <div className="filter">
                        <div>
                            <span>当前学生:</span>
                            <Select style={{ width: 200 }} value={Number(examPaperId)} onChange={handleSelectedStudenChange}>
                                {studentList.map((item: any) => (
                                    <Option key={item.examPaperId} value={item.examPaperId}>
                                        {item.username}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <Button>上一位</Button>
                        <Button>下一位</Button>
                        <div className="select">
                            <div>筛选：</div>
                            <Select style={{ width: 270 }} value={queryType} onChange={handleSelectChange}>
                                <Option value="all">全部</Option>
                                <Option value="error">只看错题</Option>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="score">
                        <span>考试成绩:</span>
                        <span>90</span>
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