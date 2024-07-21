import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip, Divider, Skeleton } from 'antd';
import type { TableColumnsType } from 'antd';
import { get, baseUrl } from '../../service/tools';
import '../../style/pageStyle/StuPaperDetail.less';
import { useLocation } from 'react-router-dom';
import { Choice, Pack, LongReading, CfReading } from '../questionTableCell';
import { ReactComponent as GenuineSvg } from '../../assets/svg/genuine.svg';
import { QuestionType, getErrorCount } from '../../utils/question';
import cn from 'classnames';
import qs from 'qs';

const { Option } = Select;
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

interface Props {
    query: any,
}

const StuPaperDetail = ({ query }: Props) => {
    const [list, setList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [selectedExamPaperId, setSelectedExamPaperId] = useState<Number>(Number(query?.examPaperId));
    const [paperName, setPaperName] = useState('');
    const [score, setScore] = useState(0);
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
            path: `/stuRank?examId=${examId}`,
            breadcrumbName: `成绩排行`,
        },
        {
            path: '/app/test/testPaper/stuDetail',
            breadcrumbName: '卷面详情',
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
            key: 'result',
            dataIndex: 'result',
            title: '判定',
            render: (text: string, record: any) => record.rightKey === record.choiceKey ? 
            <div style={{color: "#02CA00"}}>正确</div> : <div style={{color: "#FF0000"}}>错误</div>
        },
        {
            key: 'operation',
            dataIndex: 'operation',
            title: '操作',
            render: (text: string, record: any) => (
                <div className="edit">
                    <div className='edit' onClick={(record) => showDetail(record)}>详情</div>
                </div>
            )
        },
    ];

    const init = async () => {
        await getStudentList();
    }

    const showDetail = (record: any) => {
        console.log(record);
    };

    const getData = async () => {
        const params = {
            examPaperId,
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
        const result = res?.data?.parts;
        result.forEach((part: any) => {
            part.questionList.forEach((question:any, index:number)=>{
                question.key = index+1
            })
        });
        setList(result);
        setTotal(res?.data?.parts.length);
    }
    // 获取学生列表
    const getStudentList = useCallback(async () => {
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/list?pageSize=99999&pageNo=1&examId=${examId}&batchId=${batchId}&classId=${classId}&query=${query.query}`,
        });
        const selectedStudent = res?.data?.examPaperList?.find((item: any) => item.examPaperId === selectedExamPaperId)
        setStudentList(res?.data?.examPaperList)
        setPaperName(selectedStudent?.username)
        setScore(selectedStudent?.score)
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
    useEffect(() => {
        getData();
    }, [examPaperId, queryType, pageNo, pageSize]);
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
                            <Select style={{ width: 170 }} value={Number(examPaperId)} onChange={handleSelectedStudenChange}>
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
                            <Select style={{ width: 170 }} value={queryType} onChange={handleSelectChange}>
                                <Option value="all">全部</Option>
                                <Option value="error">只看错题</Option>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="score">
                        <span>考试成绩:</span>
                        <span>{score}</span>
                    </div>
                </div>
                <div className="table">
                    {
                        list.map((part:any)=>(
                            <Table
                                columns={columns}
                                dataSource={part.questionList}
                                size={'middle'}
                                bordered={false}
                                pagination={false}
                            />
                        ))
                    }
                </div>
                {/* <div className={list?.length ? 'pag' : 'display-none'}>
                    <Pagination
                        defaultCurrent={1}
                        pageSize={pageSize}
                        current={pageNo}
                        total={total}
                        onChange={handlePaginationChange}
                        showQuickJumper
                        showSizeChanger
                    />
                </div> */}
            </div>
        </div>
    )
};

export default StuPaperDetail;