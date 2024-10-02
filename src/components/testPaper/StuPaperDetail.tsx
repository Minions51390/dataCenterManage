import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Input, Button, PageHeader, Select, Tooltip, Divider, Skeleton } from 'antd';
import { EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { get, baseUrl } from '../../service/tools';
import '../../style/pageStyle/StuPaperDetail.less';
import { useLocation } from 'react-router-dom';
import { Choice, Pack, LongReading, CfReading } from '../questionTableCell';
import StuPaperDetailMore from './StuPaperDetailMore'
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
    const [studentList, setStudentList] = useState([{examPaperId:'0'}]);
    const [selectedExamPaperId, setSelectedExamPaperId] = useState<String>(String(query?.examPaperId));
    const [paperName, setPaperName] = useState('');
    const [score, setScore] = useState(0);
    const [queryType, setQueryType] = useState('all');
    const [preview, setPreview] = useState(false);
    const [stuCard, setStuCard] = useState([]);
    const [stuPart, setStuPart] = useState([]);
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
            path: '/app/test/testRank/stuDetail',
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
            render: (text: string, record: any) => {
                console.log('record', record)
                return record.rightKey === record.choiceKey ? 
                <div style={{color: "#02CA00"}}>正确{record.rightKey === record.choiceKey}</div> : <div style={{color: "#FF0000"}}>错误{record.rightKey === record.choiceKey}</div>
            }
        },
        {
            key: 'operation',
            dataIndex: 'operation',
            title: '操作',
            render: (text: string, record: any) => (
                <div className="edit">
                    <div className="edit" onClick={(record) => handlePreviewClick(record)}>详情</div>
                </div>
            )
        },
    ];

    const init = async () => {
        await getStudentList();
    }
    // 获取学生列表
    const getStudentList = useCallback(async () => {
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/list?pageSize=99999&pageNo=1&examId=${examId}&batchId=${batchId}&classId=${classId}&query=${query.query}`,
        });
        const selectedStudent = res?.data?.examPaperList?.find((item: any) => item.examPaperId == selectedExamPaperId)
        setStudentList(res?.data?.examPaperList)
        setPaperName(selectedStudent?.username)
        setScore(selectedStudent?.score)
    }, [batchId, classId, examId, query.query, selectedExamPaperId])

    // 获取选中学生卷面详情
    const getDetailData = async () => {
        const params = {
            examPaperId:selectedExamPaperId,
            queryType,
            pageNo: 1,
            pageSize: 20,
        };
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/question/list`,
            config: {
                params
            }
        });
        const result = res?.data?.parts;
        result.forEach((part: any) => {
            part.questionList.forEach((question:any, index:number)=>{
                question.key = index+1
            })
        });
        setList(result);
        setScore(res?.data?.score);
    }

    // 获取选中学生卷面预览
    const getPreviewData = async () => {
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/detail?paperId=${selectedExamPaperId}`,
        });
        console.log('res?.data?.part', res?.data?.part)
        setStuCard(res?.data?.card);
        setStuPart(res?.data?.part);
    }
    
    // 更换选中学生
    const handleSelectedStudentChange = (examPaperId: String) => {
        setSelectedExamPaperId(examPaperId);
    }
    // 更换筛选
    const handleSelectChange = (v: string) => {
        setQueryType(v);
    }
    // 上一位学生
    const handlePrevStudentClick = () => {
        const index = studentList.findIndex((item: any) => String(item.examPaperId) === selectedExamPaperId);
        if (index > 0) {
            setSelectedExamPaperId(String(studentList[index - 1]?.examPaperId));
        }
        if (index === 0){
            setSelectedExamPaperId(String(studentList[studentList.length - 1]?.examPaperId));
        }
    }
    // 下一位学生
    const handleNextStudentClick = () => {
        const index = studentList.findIndex((item: any) => String(item.examPaperId) === selectedExamPaperId);
        if (index < studentList.length - 1) {
            setSelectedExamPaperId(String(studentList[index + 1]?.examPaperId));
        }
        if (index === studentList.length - 1) {
            setSelectedExamPaperId(String(studentList[0]?.examPaperId));
        }
    }
    const handlePreviewClick = (record: any) => {
        // if(!preview){
        //     getPreviewData();
        // }
        setPreview(!preview);
    };
    useEffect(()=>{
        init();
    }, [examPaperId])
    useEffect(() => {
        getDetailData();
    }, [selectedExamPaperId, queryType]);
    useEffect(() => {
        if(preview){
            getPreviewData();
        }
    }, [selectedExamPaperId, preview])
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
                            <Select style={{ width: 170 }} value={String(selectedExamPaperId)} onChange={handleSelectedStudentChange}>
                                {studentList.map((item: any) => (
                                    <Option key={item.examPaperId} value={String(item.examPaperId)}>
                                        {item.username}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <Button onClick={handlePrevStudentClick}>上一位</Button>
                        <Button onClick={handleNextStudentClick}>下一位</Button>
                        <div className="select">
                            <div>筛选：</div>
                            <Select style={{ width: 170 }} value={queryType} onChange={handleSelectChange}>
                                <Option value="all">全部</Option>
                                <Option value="error">只看错题</Option>
                            </Select>
                        </div>
                    </div>
                    <div className="score">
                        <span className="score-text">考试成绩:</span>
                        <span className="score-value">{score}</span>
                    </div>
                    <div className="preview">
                        {
                            preview ? <Button onClick={handlePreviewClick} icon={<RollbackOutlined />}>返回列表</Button> : <Button onClick={handlePreviewClick} icon={<EyeOutlined />}>预览卷面</Button>
                        }
                        
                    </div>
                </div>
                {
                    preview ? (
                        <StuPaperDetailMore card={stuCard} part={stuPart} score={score} />
                    ) : (
                        <div className="table">
                            {
                                list.map((part:any)=>(
                                    <div className="table-wrapper">
                                        <div className="table-title">{part.partName}{part.partDesc}</div>
                                        {
                                            part.questionList?.questions ? (
                                                <Table
                                                    columns={columns}
                                                    dataSource={part.questionList?.questions}
                                                    size={'middle'}
                                                    bordered={false}
                                                    pagination={false}
                                                />
                                            ): (
                                                <Table
                                                    columns={columns}
                                                    dataSource={part.questionList}
                                                    size={'middle'}
                                                    bordered={false}
                                                    pagination={false}
                                                />
                                            )
                                        }
                                        
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
};

export default StuPaperDetail;